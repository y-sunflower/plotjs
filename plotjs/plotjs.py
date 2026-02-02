import os
import io
import random
import uuid
import webbrowser
import tempfile
from typing import Optional

import numpy as np
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from narwhals.typing import SeriesT
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.axes import Axes

from plotjs.utils import _vector_to_list, _get_and_sanitize_js
from plotjs import css, javascript

MAIN_DIR: str = Path(__file__).parent
TEMPLATE_DIR: str = MAIN_DIR / "static"
CSS_PATH: str = os.path.join(TEMPLATE_DIR, "default.css")
JS_PARSER_PATH: str = os.path.join(TEMPLATE_DIR, "plotparser.js")

env: Environment = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


class PlotJS:
    """
    Class to convert static matplotlib plots to interactive charts.
    """

    def __init__(
        self,
        fig: Figure | None = None,
        **savefig_kws: dict,
    ):
        """
        Initiate an `PlotJS` instance to convert matplotlib
        figures to interactive charts.

        Args:
            fig: An optional matplotlib figure. If None, uses `plt.gcf()`.
            savefig_kws: Additional keyword arguments passed to `plt.savefig()`.
        """
        if fig is None:
            fig: Figure = plt.gcf()
        buf: io.StringIO = io.StringIO()

        # temporary change svg hashsalt and id for reproductibility
        # https://github.com/y-sunflower/plotjs/issues/54
        old_svg_hashsalt = plt.rcParams["svg.hashsalt"]
        old_svg_id = plt.rcParams["svg.id"]
        plt.rcParams["svg.hashsalt"] = "svg-hashsalt"
        plt.rcParams["svg.id"] = "svg-id"
        fig.savefig(buf, format="svg", **savefig_kws)
        fig.savefig("debug.svg", **savefig_kws)
        plt.rcParams["svg.hashsalt"] = old_svg_hashsalt
        plt.rcParams["svg.id"] = old_svg_id

        buf.seek(0)
        self._svg_content = buf.getvalue()

        self._axes: list[Axes] = fig.get_axes()

        rnd = random.Random(22022001)
        self._uuid = uuid.UUID(int=rnd.getrandbits(128))

        self.additional_css = ""
        self.additional_javascript = ""
        self._hover_nearest = False
        self._template = env.get_template("template.html")

        with open(CSS_PATH) as f:
            self._default_css = f.read()

        self._js_parser = _get_and_sanitize_js(
            file_path=JS_PARSER_PATH,
            after_pattern=r"class Selection.*",
        )

    def add_tooltip(
        self,
        *,
        labels: list | tuple | np.ndarray | SeriesT | None = None,
        groups: list | tuple | np.ndarray | SeriesT | None = None,
        tooltip_x_shift: int = 0,
        tooltip_y_shift: int = 0,
        hover_nearest: bool = False,
        on: str | list[str] | None = None,
        ax: Axes | None = None,
    ) -> "PlotJS":
        """
        Add a tooltip to the interactive plot. You can set either
        just `labels`, just `groups`, both or none.

        Args:
            labels: An iterable containing the labels for the tooltip.
                It corresponds to the text that will appear on hover.
            groups: An iterable containing the group for tooltip. It
                corresponds to how to 'group' the tooltip. The easiest
                way to understand this argument is to check the examples
                below. Also note that the use of this argument is required
                to 'connect' the legend with plot elements.
            tooltip_x_shift: Number of pixels to shift the tooltip from
                the cursor, on the x axis.
            tooltip_y_shift: Number of pixels to shift the tooltip from
                the cursor, on the y axis.
            hover_nearest: When `True`, hover the nearest plot element.
            on: Which plot elements to apply interactivity to. Can be a
                single element type or a list. Valid values are "point",
                "line", "bar", "area" (plurals like "points" also accepted).
                If `None` (default), applies to all element types.
            ax: A matplotlib Axes. If `None` (default), uses first Axes.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            PlotJS(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
            )
            ```

            ```python
            PlotJS(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
                columns=["S&P500", "CAC40", "Sunflower"],
            )
            ```

            ```python
            PlotJS(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
                hover_nearest=True,
            )
            ```

            ```python
            PlotJS(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
                on="point",  # only apply hover to points
            )
            ```

            ```python
            PlotJS(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
                on=["point", "line"],  # apply hover to points and lines only
            )
            ```
        """
        self._tooltip_x_shift = tooltip_x_shift
        self._tooltip_y_shift = tooltip_y_shift

        # Normalize and validate the `on` parameter
        valid_elements = {"point", "line", "bar", "area"}
        plural_to_singular = {
            "points": "point",
            "lines": "line",
            "bars": "bar",
            "areas": "area",
        }

        if on is None:
            normalized_on = None
        else:
            if isinstance(on, str):
                on = [on]
            normalized_on = []
            for element in on:
                element = element.lower()
                element = plural_to_singular.get(element, element)
                if element not in valid_elements:
                    raise ValueError(
                        f"Invalid element type '{element}' in `on` parameter. "
                        f"Valid values are: {', '.join(sorted(valid_elements))} "
                        f"(plurals also accepted)."
                    )
                if element not in normalized_on:
                    normalized_on.append(element)

        if ax is None:
            ax: Axes = self._axes[0]
        self._legend_handles, self._legend_handles_labels = (
            ax.get_legend_handles_labels()
        )

        if labels is None:
            self._tooltip_labels = []
        else:
            self._tooltip_labels = _vector_to_list(labels)
            self._tooltip_labels.extend(self._legend_handles_labels)
        if groups is None:
            self._tooltip_groups = list(range(len(self._tooltip_labels)))
        else:
            self._tooltip_groups = _vector_to_list(groups)
            self._tooltip_groups.extend(self._legend_handles_labels)

        if not hasattr(self, "_axes_tooltip"):
            self._axes_tooltip: dict = dict()
        axe_idx: int = self._axes.index(ax) + 1
        axe_tooltip: dict[str, dict] = {
            f"axes_{axe_idx}": {
                "tooltip_labels": self._tooltip_labels,
                "tooltip_groups": self._tooltip_groups,
                "hover_nearest": "true" if hover_nearest else "false",  # js boolean
                "on": normalized_on,  # None means all elements, otherwise list of element types
            }
        }
        self._axes_tooltip.update(axe_tooltip)

        return self

    def add_css(
        self,
        from_string: Optional[str] = None,
        *,
        from_dict: Optional[dict] = None,
        from_file: Optional[str] = None,
    ) -> "PlotJS":
        """
        Add CSS to the final HTML output. This function allows you to override
        default styles or add custom CSS rules.

        See the [CSS guide](../guides/css/index.md) for more info on how to work with CSS.

        Args:
            from_string: CSS rules to apply, as a string.
            from_dict: CSS rules to apply, as a dictionnary.
            from_file: CSS rules to apply from a CSS file.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            PlotJS(...).add_css('.tooltip {"color": "red";}')
            ```

            ```python

            PlotJS(...).add_css(from_file="path/to/styles.css")
            ```

            ```python
            from plotjs import css

            PlotJS(...).add_css(from_dict={".tooltip": {"color": "red";}})
            ```

            ```python
            from plotjs import css

            PlotJS(...).add_css(
                from_dict={".tooltip": {"color": "red";}},
            ).add_css(
                from_dict={".tooltip": {"background": "blue";}},
            )
            ```
        """
        if from_string:
            self.additional_css += from_string
        elif from_dict:
            self.additional_css += css.from_dict(from_dict)
        elif from_file:
            self.additional_css += css.from_file(from_file)
        else:
            raise ValueError(
                "Must provide at least one of: `from_string`, `from_dict`, `from_file`."
            )
        return self

    def add_javascript(
        self, from_string: Optional[str] = None, *, from_file: Optional[str] = None
    ) -> "PlotJS":
        """
        Add custom JavaScript to the final HTML output. This function allows
        users to enhance interactivity, define custom behaviors, or extend
        the existing chart logic.

        Args:
            from_string: JavaScript code to include, as a string.
            from_file: JavaScript code to apply from a JS file.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            PlotJS(...).add_javascript("console.log('Custom JS loaded!');")
            ```

            ```python
            from plotjs import javascript

            custom_js = javascript.from_file("script.js")
            PlotJS(...).add_javascript(custom_js)
            ```
        """
        if from_string:
            self.additional_javascript += from_string
        elif from_file:
            self.additional_javascript += javascript.from_file(from_file)
        else:
            raise ValueError(
                "Must provide at least one of: `from_string`, `from_file`."
            )
        return self

    def add_d3js(self, version: int = 7) -> "PlotJS":
        """
        Add D3.js library import in the additional JavaScript code.
        This is mostly useful when adding custom JS that relies on
        D3.

        Arguments:
            version: D3.js version to use, default to 7.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            (
                PlotJS()
                .add_d3js()
                .add_javascript("d3.selectAll(".point").on("click", () => alert("I wish cookies were 0 calories..."));"
                )
            )
            ```
        """
        self.additional_javascript += (
            f"import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@{version}/+esm';"
        )
        return self

    def save(
        self,
        file_path: str,
        favicon_path: str = "https://github.com/JosephBARBIERDARNAL/static/blob/main/python-libs/plotjs/favicon.ico?raw=true",
        document_title: str = "Made with plotjs",
    ) -> "PlotJS":
        """
        Save the interactive matplotlib plots to an HTML file.

        Args:
            file_path: Where to save the HTML file. If the ".html"
                extension is missing, it's added.
            favicon_path: Path to a favicon file, remote or local.
                The default is the logo of plotjs.
            document_title: String used for the page title (the title
                tag inside the head of the html document).

        Returns:
            The instance itself to allow method chaining.

        Examples:
            ```python
            PlotJS(...).save("index.html")
            ```

            ```python
            PlotJS(...).save("path/to/my_chart.html")
            ```
        """
        self._favicon_path = favicon_path
        self._document_title = document_title

        self._set_html()

        if not file_path.endswith(".html"):
            file_path += ".html"
        with open(file_path, "w") as f:
            f.write(self.html)

        # store the file path for later use (e.g., show() method)
        self._file_path = os.path.abspath(file_path)

        return self

    def as_html(self) -> str:
        """
        Retrieve the interactive plot as an HTML string.
        This can be useful to display the plot in
        environment such as marimo, or do advanced customization.

        Returns:
            A string with all the HTML of the plot.

        Examples:
            ```python
            import marimo as mo
            from plotjs import PlotJS, data

            df = data.load_iris()

            html_plot = (
                PlotJS(fig=fig)
                .add_tooltip(labels=df["species"])
                .as_html()
            )

            # display in marimo
            mo.iframe(html_plot)
            ```
        """
        self._set_html()
        return self.html

    def show(self) -> "PlotJS":
        """
        Open the HTML file in the default browser.
        If the file hasn't been saved yet, it will be saved to a temporary file.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            PlotJS(fig).save("output.html").show()
            ```

            ```python
            # Open without explicitly saving (uses temp file)
            PlotJS(fig).show()
            ```
        """
        if not hasattr(self, "_file_path"):
            temp_file = tempfile.NamedTemporaryFile(
                mode="w", suffix=".html", delete=False
            )
            self.save(temp_file.name)
            temp_file.close()

        webbrowser.open(f"file://{self._file_path}")
        return self

    def _set_plot_data_json(self) -> None:
        if not hasattr(self, "_tooltip_labels"):
            self.add_tooltip()

        self.plot_data_json = {
            "tooltip_labels": self._tooltip_labels,
            "tooltip_groups": self._tooltip_groups,
            "tooltip_x_shift": self._tooltip_x_shift,
            "tooltip_y_shift": self._tooltip_y_shift,
            "hover_nearest": self._hover_nearest,
            "axes": self._axes_tooltip,
        }

    def _set_html(self) -> None:
        self._set_plot_data_json()
        self.html: str = self._template.render(
            uuid=str(self._uuid),
            default_css=self._default_css,
            js_parser=self._js_parser,
            additional_css=self.additional_css,
            additional_javascript=self.additional_javascript,
            svg=self._svg_content,
            plot_data_json=self.plot_data_json,
            favicon_path=self._favicon_path,
            document_title=self._document_title,
        )

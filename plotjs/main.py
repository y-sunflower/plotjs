import numpy as np
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

from narwhals.typing import SeriesT

import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.axes import Axes

import os
import uuid
from typing import Literal, Text

from plotjs.utils import _vector_to_list

if os.getcwd() == "/Users/josephbarbier/Desktop/plotjs":
    # for debugging
    TEMPLATE_DIR = f"{os.getcwd()}/plotjs/static"
else:
    TEMPLATE_DIR: str = Path(__file__).parent / "static"
CSS_PATH: str = os.path.join(TEMPLATE_DIR, "default.css")
D3_PATH: str = os.path.join(TEMPLATE_DIR, "d3.min.js")
JS_PATH: str = os.path.join(TEMPLATE_DIR, "main.js")

env: Environment = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


class InteractivePlot:
    """
    Class to convert static matplotlib plots to interactive charts.
    """

    def __init__(
        self,
        *,
        tooltip_x_shift: int = 10,
        tooltip_y_shift: int = -10,
        fig: Figure | None = None,
        **savefig_kws: dict,
    ):
        """
        Initiate an `InteractivePlot` instance to convert matplotlib
        figures to interactive charts.

        Args:
            fig: An optional matplotlib figure. If None, uses `plt.gcf()`.
            tooltip_x_shift: Number of pixels to shift the tooltip from
                the cursor, on the x axis.
            tooltip_y_shift: Number of pixels to shift the tooltip from
                the cursor, on the y axis.
            savefig_kws: Additional keyword arguments passed to `plt.savefig()`.
        """
        svg_path: Literal["user_plot.svg"] = "user_plot.svg"
        self.tooltip_x_shift = tooltip_x_shift
        self.tooltip_y_shift = tooltip_y_shift

        if fig is None:
            fig: Figure = plt.gcf()
        self.fig = fig
        self.fig.savefig(svg_path, **savefig_kws)
        axes: Axes = self.fig.get_axes()
        self.ax = axes[0]
        self.legend_handles, self.legend_handles_labels = (
            self.ax.get_legend_handles_labels()
        )

        self.additional_css = ""
        self.svg_content = Path(svg_path).read_text()
        self.template = env.get_template("template.html")

        with open(CSS_PATH) as f:
            self.default_css = f.read()

        with open(D3_PATH) as f:
            self.d3js = f.read()

        with open(JS_PATH) as f:
            self.js = f.read()

    def add_tooltip(
        self,
        *,
        labels: list | tuple | np.ndarray | SeriesT | None = None,
        groups: list | tuple | np.ndarray | SeriesT | None = None,
    ):
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

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            InteractivePlot(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
            )
            ```

            ```python
            InteractivePlot(...).add_tooltip(
                labels=["S&P500", "CAC40", "Sunflower"],
                columns=["S&P500", "CAC40", "Sunflower"],
            )
            ```
        """
        if labels is None:
            self.tooltip_labels = []
        else:
            self.tooltip_labels = _vector_to_list(labels)
            self.tooltip_labels.extend(self.legend_handles_labels)
        if groups is None:
            self.tooltip_groups = list(range(len(self.tooltip_labels)))
        else:
            self.tooltip_groups = _vector_to_list(groups)
            self.tooltip_groups.extend(self.legend_handles_labels)

        return self

    def _set_plot_data_json(self):
        if not hasattr(self, "tooltip_labels"):
            self.add_tooltip()

        self.plot_data_json = {
            "tooltip_labels": self.tooltip_labels,
            "tooltip_groups": self.tooltip_groups,
            "tooltip_x_shift": self.tooltip_x_shift,
            "tooltip_y_shift": self.tooltip_y_shift,
        }

    def _set_html(self):
        self._set_plot_data_json()
        self.html: Text = self.template.render(
            uuid=str(uuid.uuid4()),
            default_css=self.default_css,
            additional_css=self.additional_css,
            svg=self.svg_content,
            plot_data_json=self.plot_data_json,
        )

    def add_css(self, css_content: str):
        """
        Add CSS to the final HTML output. This function allows you to override
        default styles or add custom CSS rules.

        See the [CSS guide](../../guides/css/) for more info on how to work with CSS.

        Args:
            css_content: CSS rules to apply, as a string.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            InteractivePlot(...).add_css('.tooltip {"color": "red";}')
            ```

            ```python
            from plotjs import css

            InteractivePlot(...).add_css(css.from_file("path/to/style.css"))
            ```

            ```python
            from plotjs import css

            InteractivePlot(...).add_css(css.from_dict({".tooltip": {"color": "red";}}))
            ```

            ```python
            from plotjs import css

            InteractivePlot(...).add_css(
                css.from_dict({".tooltip": {"color": "red";}}),
            ).add_css(
                css.from_dict({".tooltip": {"background": "blue";}}),
            )
            ```
        """
        self.additional_css += css_content
        return self

    def save(self, file_path: str):
        """
        Save the interactive matplotlib plots to an HTML file.

        Args:
            file_path: Where to save the HTML file. If the ".html"
                extension is missing, it's added.

        Examples:
            ```python
            InteractivePlot(...).save("index.html")
            ```

            ```python
            InteractivePlot(...).save("path/to/my_chart.html")
            ```
        """
        self._set_html()
        if not file_path.endswith(".html"):
            file_path += ".html"
        with open(file_path, "w") as f:
            f.write(self.html)

        return self


if __name__ == "__main__":
    from plotjs import data

    df = data.load_iris()

    fig, ax = plt.subplots()

    for specie in df["species"].unique():
        specie_df = df[df["species"] == specie]
        ax.scatter(
            specie_df["sepal_length"],
            specie_df["sepal_width"],
            s=200,
            ec="black",
            label=specie,
        )
    ax.legend()

    InteractivePlot().add_tooltip(df["species"]).save("index.html")

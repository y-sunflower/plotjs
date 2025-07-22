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
        tooltip: list | tuple | np.ndarray | SeriesT | None = None,
        tooltip_group: list | tuple | np.ndarray | SeriesT | None = None,
        fig: Figure | None = None,
        **savefig_kws: dict,
    ):
        """
        Initiate an `InteractivePlot` instance to convert matplotlib
        figures to interactive charts.

        Args:
            tooltip: An iterable containing the labels for the tooltip.
            tooltip_group: An iterable containing the group for tooltip.
            fig: An optional matplotlib figure. If None, uses `plt.gcf()`.
            savefig_kws: Additional keyword arguments passed to `plt.savefig()`.
        """
        svg_path: Literal["user_plot.svg"] = "user_plot.svg"

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

        # tooltip inputs
        if tooltip is None:
            self.tooltip = []
        else:
            self.tooltip = _vector_to_list(tooltip)
            self.tooltip.extend(self.legend_handles_labels)
        if tooltip_group is None:
            self.tooltip_group = list(range(len(self.tooltip)))
        else:
            self.tooltip_group = _vector_to_list(tooltip_group)
            self.tooltip_group.extend(self.legend_handles_labels)

        self._set_plot_data_json()

    def _set_plot_data_json(self):
        self.plot_data_json = {
            "tooltip": self.tooltip,
            "tooltip_group": self.tooltip_group,
        }

    def _set_html(self):
        self.html: Text = self.template.render(
            uuid=str(uuid.uuid4()),
            default_css=self.default_css,
            additional_css=self.additional_css,
            svg=self.svg_content,
            plot_data_json=self.plot_data_json,
        )

    def add_css(self, css_content: str | dict, selector: str | None = None):
        """
        Add CSS to the final HTML output. This function allows you to override
        default styles or add custom CSS rules.

        Args:
            css_content: CSS rules to apply. This can be:

                - A dictionary of CSS property-value pairs (e.g., {"color": "red"}).
                When using a dict, a `selector` must be provided.
                - A string representing either the path to a CSS file or raw CSS code.
            selector: A CSS selector (e.g., ".my-class" or "#id") to wrap around the
                dictionary styles. Required if `css_content` is a dict, ignored otherwise.

        Returns:
            self: Returns the instance to allow method chaining.

        Examples:
            ```python
            InteractivePlot(...).add_css({"color": "red"}, selector=".tooltip")
            ```

            ```python
            InteractivePlot(...).add_css("path/to/style.css")
            ```

            ```python
            InteractivePlot(...).add_css('.tooltip {"color": "red";}')
            ```

            ```python
            InteractivePlot(...).add_css(
                '.tooltip {"color": "red";}'
            ).add_css(
                '.tooltip {"background": "blue";}'
            )
            ```

        Notes:
            Don't add the `!important` tag if you're using the `dict` syntax, it's already
            added automatically to make sure default parameters are overwritten. Otherwise,
            it's recommended to add it in case you don't have the expected results.
        """
        if isinstance(css_content, dict):
            css: str = f"{selector}{{"
            for key, val in css_content.items():
                css += f"{key}:{val} !important;"
            css += "}"

            self.additional_css += css

        elif isinstance(css_content, str):
            if os.path.isfile(css_content):
                with open(css_content, "r") as f:
                    self.additional_css += f.read()
            else:
                # assume it's raw CSS content
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
    import matplotlib.pyplot as plt

    from plotjs import data

    df = data.load_iris()

    fig, ax = plt.subplots(dpi=300)

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

    ip = InteractivePlot(
        fig=fig,
        # tooltip=df["species"],
        tooltip_group=df["species"],
    ).save("index.html")

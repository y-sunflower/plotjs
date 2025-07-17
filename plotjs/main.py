import numpy as np
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

import narwhals as nw
from narwhals.dependencies import is_numpy_array, is_into_series
from narwhals.typing import SeriesT

import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.axes import Axes

import os
from typing import Literal, Text

from plotjs.polygons_mapping import _map_polygons_to_data

# TEMPLATE_DIR: str = Path(__file__).parent / "static"
TEMPLATE_DIR = "/Users/josephbarbier/Desktop/plotjs/plotjs/static"
CSS_PATH: str = os.path.join(TEMPLATE_DIR, "default.css")
D3_PATH: str = os.path.join(TEMPLATE_DIR, "d3.min.js")
JS_PATH: str = os.path.join(TEMPLATE_DIR, "main.js")

env: Environment = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


def _vector_to_list(vector, name="tooltip and tooltip_group") -> list:
    if isinstance(vector, (list, tuple)) or is_numpy_array(vector):
        return list(vector)
    elif is_into_series(vector):
        return nw.from_native(vector, allow_series=True).to_list()
    else:
        raise ValueError(
            f"{name} must be a Series or a valid iterable (list, tuple, ndarray...)."
        )


class InteractivePlot:
    """
    Class to convert static matplotlib plots to interactive charts.
    """

    def __init__(
        self,
        *,
        tooltip: list | tuple | np.ndarray | SeriesT | None,
        tooltip_group: list | tuple | np.ndarray | SeriesT | None = None,
        fig: Figure | None = None,
        gdf: object | None = None,
    ):
        """
        Initiate an `InteractivePlot` instance to convert matplotlib
        figures to interactive charts.

        Args:
            tooltip: An iterable containing the labels for the tooltip.
            tooltip_group: An iterable containing the group for tooltip.
            fig: An optional matplotlib figure. If None, uses `plt.gcf()`.
            gdf: An optional GeoDataFrame for proper polygon mapping. It's
                required when creating a choropleth map.
        """
        self.gdf = gdf
        self.additional_css = ""
        svg_path: Literal["user_plot.svg"] = "user_plot.svg"
        self.svg_content = Path(svg_path).read_text()
        self.template = env.get_template("template.html")

        if fig is None:
            fig: Figure = plt.gcf()
        self.fig = fig
        self.fig.savefig(svg_path)
        axes: Axes = self.fig.get_axes()
        if len(axes) > 1:
            raise NotImplementedError("Support only figure with 1 axes.")
        self.ax = axes[0]

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
        if tooltip_group is None:
            self.tooltip_group = list(range(len(self.tooltip)))
        else:
            self.tooltip_group = _vector_to_list(tooltip_group)

        # edge case with choropleth maps
        if gdf is not None and len(self.ax.collections) > 0:
            self.polygon_to_data_mapping = _map_polygons_to_data(
                self.ax.collections[0], gdf, tooltip
            )
        else:
            self.polygon_to_data_mapping = ""
        self._set_plot_data_json()

    def _set_plot_data_json(self):
        self.plot_data_json = {
            "tooltip": self.tooltip,
            "tooltip_group": self.tooltip_group,
            "polygon_mapping": self.polygon_to_data_mapping,
        }

    def _set_html(self):
        self.html: Text = self.template.render(
            d3js=self.d3js,
            js=self.js,
            svg=self.svg_content,
            default_css=self.default_css,
            additional_css=self.additional_css,
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


if __name__ == "__main__":
    import matplotlib.pyplot as plt
    import geopandas as gpd

    df = gpd.read_file(
        "https://github.com/holtzy/The-Python-Graph-Gallery/blob/master/static/data/europe.geojson?raw=true"
    ).dropna()
    df = df[df["name"] != "Russia"]

    fig, ax = plt.subplots()
    ax.set_xlim(-25, 42)
    ax.set_ylim(30, 82)
    ax.axis("off")
    df.plot(column="pop_est", ax=ax, cmap="viridis_r")

    custom_tooltip = df.apply(
        lambda row: f"{row['name']}<br>Population of {round(row['pop_est'] / 1_000_000, 1)} millions",
        axis=1,
    )

    InteractivePlot(
        fig=fig,
        tooltip=custom_tooltip,
        gdf=df,
    ).add_css({"width": "70%"}, selector="svg").save("index.html")

from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import narwhals as nw
from narwhals.dependencies import is_numpy_array, is_into_series

import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.axes import Axes
from matplotlib.collections import PathCollection

import os
from typing import Literal, Text

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
    def __init__(
        self,
        *,
        tooltip: list,
        tooltip_group: list | None = None,
        fig: Figure | None = None,
    ):
        self.additional_css = ""
        svg_path: Literal["user_plot.svg"] = "user_plot.svg"

        if fig is None:
            fig: Figure = plt.gcf()
        self.fig = fig
        self.fig.savefig(svg_path)

        self.svg_content = Path(svg_path).read_text()
        self.template = env.get_template("template.html")

        with open(CSS_PATH) as f:
            self.default_css = f.read()

        with open(D3_PATH) as f:
            self.d3js = f.read()

        with open(JS_PATH) as f:
            self.js = f.read()

        axes: Axes = self.fig.get_axes()
        if len(axes) > 1:
            raise NotImplementedError("Support only figure with 1 axes.")

        self.ax = axes[0]
        self.children = self.ax.get_children()

        # tooltip inputs
        self.tooltip = _vector_to_list(tooltip)
        if tooltip_group is None:
            self.tooltip_group = list(range(len(self.tooltip)))
        else:
            self.tooltip_group = _vector_to_list(tooltip_group)

        # store all plot info not in SVG
        self._set_scatter_data()
        self._set_x_and_y_labels()
        self._set_plot_data_json()

    def _set_x_and_y_labels(self):
        if self.ax.get_xlabel() == "":
            self.x_label = "x"
        else:
            self.x_label = self.ax.get_xlabel()

        if self.ax.get_ylabel() == "":
            self.y_label = "y"
        else:
            self.y_label = self.ax.get_ylabel()

    def _set_scatter_data(self):
        is_path_collection: list[bool] = [
            isinstance(artist, PathCollection) for artist in self.children
        ]
        has_scatter_plot: bool = any(is_path_collection)

        if sum(is_path_collection) > 1:
            raise ValueError(
                f"Multiple PathCollection found in artists: {self.children}"
            )

        if has_scatter_plot:
            index_path_collection: int = is_path_collection.index(True)
            self.scatter_data = self.children[index_path_collection].get_offsets().data
            self.scatter_data_json = [
                {"x": x, "y": y} for x, y in self.scatter_data.tolist()
            ]
        else:
            self.scatter_data_json = None

    def _set_plot_data_json(self):
        self.plot_data_json = {
            "y_label": self.y_label,
            "x_label": self.x_label,
            "scatter_data": self.scatter_data_json,
            "tooltip": self.tooltip,
            "tooltip_group": self.tooltip_group,
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

    def save(self, file_path):
        self._set_html()
        with open(file_path, "w") as f:
            f.write(self.html)


if __name__ == "__main__":
    import matplotlib.pyplot as plt
    import pandas as pd

    path = "https://github.com/y-sunflower/fleur/blob/main/fleur/data/iris.csv?raw=true"
    df = pd.read_csv(path)
    df["tooltip"] = (
        "Sepal length = "
        + df["sepal_length"].astype(str)
        + "<br>"
        + "Sepal width = <i><b>"
        + df["sepal_width"].astype(str)
        + "</b></i><br>"
        + df["species"].str.upper()
    )

    fig, ax = plt.subplots()
    ax.scatter(
        df["sepal_length"],
        df["sepal_width"],
        c=df["species"].astype("category").cat.codes,
        s=300,
        alpha=0.5,
        ec="black",
    )
    ax.set_xlabel("sepal_length")
    ax.set_ylabel("sepal_width")

    InteractivePlot(
        fig=fig,
        tooltip=df["tooltip"],
        tooltip_group=df["species"],
    ).add_css(
        {"opacity": "0.1", "fill": "red"},
        selector=".not-hovered",
    ).save("index.html")

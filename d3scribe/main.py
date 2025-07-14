from pathlib import Path
from jinja2 import Environment, FileSystemLoader

import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.collections import PathCollection

import os
import json
from typing import Literal, Text

# TEMPLATE_DIR: str = Path(__file__).parent / "static"
# D3_DIR: str = os.path.join(
#     os.path.dirname(os.path.abspath(__file__)),
#     "static",
#     "d3.min.js",
# )
TEMPLATE_DIR = "/Users/josephbarbier/Desktop/d3scribe/d3scribe/static"
env: Environment = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


class interactivePlot:
    def __init__(self, fig: Figure | None = None):
        svg_path: Literal["user_plot.svg"] = "user_plot.svg"

        if fig is None:
            fig: Figure = plt.gcf()
        self.fig = fig
        self.fig.savefig(svg_path)

        self.svg_content = Path(svg_path).read_text()
        self.template = env.get_template("template.html")
        self.ax = self.fig.get_axes()[0]
        self.children = self.ax.get_children()

        # store all plot info not in SVG
        self._set_scatter_data()
        self._set_x_and_y_labels()

        # write json file with all plot info
        self._save_json_info()

    def save(self, file_path):
        html: Text = self.template.render(svg=self.svg_content)
        with open(file_path, "w") as f:
            f.write(html)

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
            index_path_collection = is_path_collection.index(True)
            self.scatter_data = self.children[index_path_collection].get_offsets().data
            self.scatter_data_json = [
                {"x": x, "y": y} for x, y in self.scatter_data.tolist()
            ]

        else:
            self.scatter_data_json = None

    def _save_json_info(self):
        json_file = {
            "y_label": self.y_label,
            "x_label": self.x_label,
            "scatter_data": self.scatter_data_json,
        }
        with open("plot_data.json", "w") as f:
            json.dump(json_file, f)


if __name__ == "__main__":
    import matplotlib.pyplot as plt
    import pandas as pd

    path = "https://github.com/y-sunflower/fleur/blob/main/fleur/data/iris.csv?raw=true"
    df = pd.read_csv(path)

    fig, ax = plt.subplots()
    ax.scatter(
        df["sepal_length"],
        df["sepal_width"],
        color="darkred",
        s=300,
        alpha=0.5,
        ec="black",
    )
    ax.set_xlabel("sepal_length")
    ax.set_ylabel("sepal_width")

    interactivePlot(fig=fig).save("index.html")

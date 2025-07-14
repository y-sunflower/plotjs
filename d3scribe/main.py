from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import matplotlib.pyplot as plt
from matplotlib.figure import Figure

import os
from typing import Literal, Text

TEMPLATE_DIR: str = Path(__file__).parent / "static"
D3_DIR: str = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "static",
    "d3.min.js",
)
env: Environment = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


class interactivePlot:
    def __init__(self, fig: Figure | None = None, delete_svg=False):
        svg_path: Literal["user_plot.svg"] = "user_plot.svg"

        if fig is None:
            fig: Figure = plt.gcf()
        fig.savefig(svg_path)

        self.svg_content = Path(svg_path).read_text()
        self.template = env.get_template("template.html")

        if delete_svg:
            os.remove(svg_path)

    def save(self, file_path):
        html: Text = self.template.render(svg=self.svg_content)
        with open(file_path, "w") as f:
            f.write(html)

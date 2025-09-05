import plotjs
from plotjs import data, PlotJS, css
import os
import matplotlib.pyplot as plt


def test_overall():
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

    custom_js: str = """
    document.querySelectorAll('.point').forEach(el => {
    el.addEventListener('click', function() {
        const group = this.getAttribute('data-group');

        // Toggle logic
        const active = this.classList.contains('clicked');
        document.querySelectorAll('.point').forEach(p => {
        p.classList.remove('clicked');
        p.classList.remove('dimmed');
        });

        if (!active) {
        this.classList.add('clicked');
        document.querySelectorAll('.point').forEach(p => {
            if (p.getAttribute('data-group') !== group) {
            p.classList.add('dimmed');
            }
        });
        }
    });
    });
    """

    custom_css: str = css.from_dict(
        {
            ".point.dimmed": {
                "opacity": "0.2 !important",
                "transition": "opacity 0.3s ease",
            },
            ".point.clicked": {
                "stroke": "gold !important",
                "stroke-width": "2px",
            },
        }
    )

    plot = PlotJS(fig=fig)
    (
        plot.add_tooltip(
            labels=df["species"],
            groups=df["species"],
        )
        .add_css(custom_css)
        .add_javascript(custom_js)
        .save("temp.html")
    )

    assert isinstance(plot, PlotJS)
    assert plot.additional_javascript == custom_js
    assert plot.additional_css == custom_css

    os.remove("temp.html")


def test_version():
    assert plotjs.__version__ == "0.0.5"

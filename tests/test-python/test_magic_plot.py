from plotjs import PlotJS, data
import matplotlib.pyplot as plt


def test_add_css_method_chaining():
    df = data.load_iris()

    fig, ax = plt.subplots()
    ax.scatter(df["sepal_width"], df["sepal_length"])

    mp = (
        PlotJS(fig=fig)
        .add_css(".tooltip{font-size: 2em;color: red;}")
        .add_css(".point.hovered{opacity: 0.4;}")
    )

    assert (
        mp.additional_css
        == ".tooltip{font-size: 2em;color: red;}.point.hovered{opacity: 0.4;}"
    )

    mp.add_css(".line.not-hovered{opacity: 0.8;}")

    assert (
        mp.additional_css
        == ".tooltip{font-size: 2em;color: red;}.point.hovered{opacity: 0.4;}.line.not-hovered{opacity: 0.8;}"
    )


def test_add_js_method_chaining():
    df = data.load_iris()

    fig, ax = plt.subplots()
    ax.scatter(df["sepal_width"], df["sepal_length"])

    first_js = """
d3.selectAll(".point").on("click", () =>
  alert("I wish cookies were 0 calories...")
);
"""
    second_js = """
d3.selectAll(".line").on("click", () =>
  alert("I wish cookies were 100 calories...")
);
"""

    mp = PlotJS(fig=fig).add_javascript(first_js).add_javascript(second_js)

    assert mp.additional_javascript == first_js + second_js


def test_multiple_axes_handling():
    df = data.load_iris().head(10)

    fig, axs = plt.subplots(ncols=4)
    axs[0].scatter(df["sepal_width"], df["sepal_length"])
    axs[1].scatter(df["petal_width"], df["petal_length"])
    axs[2].scatter(df["petal_width"], df["sepal_length"])
    axs[3].scatter(df["petal_length"], df["sepal_length"])

    mp = (
        PlotJS(fig=fig)
        .add_tooltip(labels=df["species"], ax=axs[0])
        .add_tooltip(groups=df["species"], ax=axs[1])
        .add_tooltip(labels=df["species"], ax=axs[2], hover_nearest=True)
        .add_tooltip(labels=df["species"], groups=df["species"], ax=axs[3])
    )

    mp._axes_tooltip == {
        "axes_1": {
            "tooltip_labels": [
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
            ],
            "tooltip_groups": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            "hover_nearest": "false",
        },
        "axes_2": {
            "tooltip_labels": [],
            "tooltip_groups": [
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
            ],
            "hover_nearest": "false",
        },
        "axes_3": {
            "tooltip_labels": [
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
            ],
            "tooltip_groups": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            "hover_nearest": "true",
        },
        "axes_4": {
            "tooltip_labels": [
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
            ],
            "tooltip_groups": [
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
                "setosa",
            ],
            "hover_nearest": "false",
        },
    }

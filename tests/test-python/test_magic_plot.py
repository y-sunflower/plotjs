from plotjs import MagicPlot, data
import matplotlib.pyplot as plt


def test_add_css_method_chaining():
    df = data.load_iris()

    fig, ax = plt.subplots()
    ax.scatter(df["sepal_width"], df["sepal_length"])

    mp = (
        MagicPlot(fig=fig)
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

    mp = MagicPlot(fig=fig).add_javascript(first_js).add_javascript(second_js)

    assert mp.additional_javascript == first_js + second_js

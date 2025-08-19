import matplotlib.pyplot as plt
from plotjs import data, PlotJS

df = data.load_iris()

fig, ax = plt.subplots()
ax.scatter(
    df["sepal_length"],
    df["sepal_width"],
    c=df["species"].astype("category").cat.codes,
    s=300,
    alpha=0.5,
    ec="black",
)

(
    PlotJS(fig=fig)
    .add_tooltip(labels=df["species"])
    .add_javascript(
        """
d3.selectAll(".point").on("click", () =>
  alert("I wish cookies were 0 calories...")
);
"""
    )
    .save("docs/iframes/javascript.html")
)

###############################

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

custom_css: str = """
.point.dimmed {
    opacity: 0.2;
}
.point.clicked {
    stroke-width: 3px;
}
"""

(
    PlotJS(fig=fig)
    .add_tooltip(
        labels=df["species"],
        groups=df["species"],
    )
    .add_css(custom_css)
    .add_javascript(custom_js)
    .save("docs/iframes/javascript2.html")
)

import matplotlib.pyplot as plt
from plotjs import InteractivePlot, data, css

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
ax.set_xlabel("Sepal Length")
ax.set_ylabel("Sepal Width")

df["tooltip"] = (
    "Sepal length = "
    + df["sepal_length"].astype(str)
    + "<br>"
    + "Sepal width = "
    + df["sepal_width"].astype(str)
    + "<br>"
    + df["species"].str.upper()
)

InteractivePlot(
    tooltip=df["tooltip"],
).add_css(".tooltip {background: red; color: blue;}").save("docs/guides/css/CSS.html")


InteractivePlot(
    tooltip=df["tooltip"],
).add_css(
    css.from_dict({".tooltip": {"background": "red", "color": "blue"}}),
)

InteractivePlot(
    tooltip=df["tooltip"],
).add_css({".tooltip": {"color": "blue"}}).add_css({".tooltip": {"background": "red"}})

InteractivePlot(
    tooltip=df["tooltip"],
).add_css(
    css.from_file("docs/static/style.css"),
).save("docs/guides/css/CSS-2.html")

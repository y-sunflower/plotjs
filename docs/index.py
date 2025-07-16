import matplotlib.pyplot as plt
from plotjs import data
from plotjs import InteractivePlot

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


InteractivePlot(tooltip=df["species"]).save("docs/quickstart.html")

InteractivePlot(
    tooltip=df["species"],
    tooltip_group=df["species"],
).save("docs/quickstart2.html")

InteractivePlot(
    tooltip=df["species"],
    tooltip_group=df["species"],
).add_css(
    {"opacity": "0.8", "fill": "red"},
    selector=".scatter-point.hovered",
).save("docs/quickstart3.html")

custom_tooltip = df.apply(
    lambda row: f"Sepal length = {row['sepal_length']}<br>"
    f"Sepal width = {row['sepal_width']}<br>"
    f"{row['species'].upper()}",
    axis=1,
)

InteractivePlot(
    tooltip=custom_tooltip,
    tooltip_group=df["species"],
).add_css(
    {
        "width": "200px",
        "text-align": "center",
        "opacity": "0.7",
        "font-size": "1.1em",
    },
    selector=".tooltip",
).save("docs/quickstart4.html")

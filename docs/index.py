import matplotlib.pyplot as plt
import numpy as np

from plotjs import data
from plotjs import InteractivePlot

np.random.seed(0)

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

##############################################################

InteractivePlot(
    tooltip=df["species"],
    tooltip_group=df["species"],
).save("docs/quickstart2.html")

##############################################################

InteractivePlot(
    tooltip=df["species"],
    tooltip_group=df["species"],
).add_css(
    {"opacity": "0.8", "fill": "red"},
    selector=".scatter-point.hovered",
).save("docs/quickstart3.html")

##############################################################

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

##############################################################

length = 500
walk1 = np.cumsum(np.random.choice([-1, 1], size=length))
walk2 = np.cumsum(np.random.choice([-1, 1], size=length))
walk3 = np.cumsum(np.random.choice([-1, 1], size=length))

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(walk1, linewidth=8, color="#264653")
ax.plot(walk2, linewidth=8, color="#2a9d8f")
ax.plot(walk3, linewidth=8, color="#e9c46a")

InteractivePlot(
    tooltip=["S&P500", "CAC40", "Bitcoin"],
).save("docs/quickstart5.html")

##############################################################

fig, ax = plt.subplots()
ax.barh(
    ["Fries", "Cake", "Apple", "Cheese"],
    [10, 30, 40, 50],
    height=0.6,
    color=["#06d6a0", "#06d6a0", "#ef476f", "#06d6a0"],
)

InteractivePlot(
    fig=fig,
    tooltip=["Fries (good)", "Cake (good)", "Apple (bad)", "Cheese (good)"],
    tooltip_group=["Good", "Good", "Bad", "Good"],
).add_css(
    {
        "width": "100px",
        "text-align": "center",
        "font-size": "1.1em",
    },
    selector=".tooltip",
).save("docs/quickstart6.html")

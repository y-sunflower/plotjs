import matplotlib.pyplot as plt
from plotjs import MagicPlot, data

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

plot = MagicPlot(fig=fig)
plot.add_tooltip(labels=df["sepal_length"]).save("docs/quickstart.html")

##############################################################

import matplotlib.pyplot as plt
from plotjs import MagicPlot, data

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

plot = MagicPlot(fig=fig)
plot.add_tooltip(
    labels=df["species"],
    groups=df["species"],
).save("docs/quickstart2.html")

##############################################################

MagicPlot().add_tooltip(
    labels=df["species"],
    groups=df["species"],
).add_css(
    ".point.hovered{opacity: 0.8 !important; fill: red !important;}",
).save("docs/quickstart3.html")

##############################################################

custom_tooltip = df.apply(
    lambda row: f"Sepal length = {row['sepal_length']}<br>"
    f"Sepal width = {row['sepal_width']}<br>"
    f"{row['species'].upper()}",
    axis=1,
)

MagicPlot().add_tooltip(
    labels=custom_tooltip,
    groups=df["species"],
).add_css(
    css.from_dict(
        {
            ".tooltip": {
                "width": "200px",
                "text-align": "center",
                "opacity": "0.7",
                "font-size": "1.1em",
            }
        }
    ),
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

MagicPlot().add_tooltip(labels=["S&P500", "CAC40", "Bitcoin"]).save(
    "docs/quickstart5.html"
)

##############################################################

fig, ax = plt.subplots()
ax.barh(
    ["Fries", "Cake", "Apple", "Cheese"],
    [10, 30, 40, 50],
    height=0.6,
    color=["#06d6a0", "#06d6a0", "#ef476f", "#06d6a0"],
)

MagicPlot().add_tooltip(
    labels=["Fries", "Cake", "Apple", "Cheese"],
    groups=["Good", "Good", "Bad", "Good"],
).add_css(
    css.from_dict(
        {
            ".tooltip": {
                "width": "100px",
                "text-align": "center",
                "font-size": "1.1em",
            }
        }
    )
).save("docs/quickstart6.html")

##############################################################

df = data.load_iris()

fig, ax = plt.subplots(dpi=300)

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

MagicPlot().add_tooltip(
    labels=df["species"],
    groups=df["species"],
).save("docs/quickstart7.html")

##############################################################

length = 500
walk1 = np.cumsum(np.random.choice([-1, 1], size=length))
walk2 = np.cumsum(np.random.choice([-1, 1], size=length))
walk3 = np.cumsum(np.random.choice([-1, 1], size=length))

labels = ["S&P500", "CAC40", "Bitcoin"]

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(walk1, linewidth=8, color="#264653", label=labels[0])
ax.plot(walk2, linewidth=8, color="#2a9d8f", label=labels[1])
ax.plot(walk3, linewidth=8, color="#e9c46a", label=labels[2])
ax.legend()

MagicPlot().add_tooltip(
    labels=labels,
    groups=labels,
).save("docs/quickstart8.html")

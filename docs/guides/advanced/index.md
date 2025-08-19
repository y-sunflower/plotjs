# TODO: find cool examples to showcase here

## Natural disasters

```py
from plotjs import PlotJS, css
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pypalettes import load_cmap
from highlight_text import fig_text, ax_text
from pyfonts import load_google_font
from drawarrow import ax_arrow

url = "https://raw.githubusercontent.com/holtzy/The-Python-Graph-Gallery/master/static/data/disaster-events.csv"
df = pd.read_csv(url)


def remove_agg_rows(entity: str):
    if entity.lower().startswith("all disasters"):
        return False
    else:
        return True


df = df.replace("Dry mass movement", "Drought")
df = df[df["Entity"].apply(remove_agg_rows)]
df = df[~df["Entity"].isin(["Fog", "Glacial lake outburst flood"])]
df = df.pivot_table(index="Entity", columns="Year", values="Disasters").T
df.loc[1900, :] = df.loc[1900, :].fillna(0)
df = df[df.index >= 1960]
df = df[df.index <= 2023]
df = df.interpolate(axis=1)
df.head()

# set up the font properties
font = load_google_font("Bebas Neue")
other_font = load_google_font("Fira Sans", weight="light")
other_bold_font = load_google_font("Fira Sans", weight="medium")

# initialize the figure
fig, ax = plt.subplots(figsize=(14, 7), dpi=300)
ax.set_axis_off()

# define the x-axis variable and order the columns
columns = df.sum().sort_values().index.to_list()
x = df.index

# defines color map and mapping with columns
colors = load_cmap("Dali").colors
color_mapping = {
    "Flood": colors[4],
    "Volcanic activity": colors[0],
    "Wildfire": colors[6],
    "Drought": colors[7],
    "Extreme temperature": colors[5],
    "Wet mass movement": colors[3],
    "Earthquake": colors[2],
    "Extreme weather": colors[1],
}
colors = [color_mapping[col] for col in columns]

# create the stacked area plot
areas = np.stack(df[columns].values, axis=-1)
ax.stackplot(x, areas, colors=colors)

# add label for the x-axis
for year in range(1960, 2030, 10):
    ax_text(
        x=year,
        y=-10,
        s=f"{year}",
        va="top",
        ha="left",
        fontsize=13,
        font=font,
        color="grey",
    )

# add label for the y-axis
for value in range(100, 400, 100):
    ax_text(
        x=1960,
        y=value,
        s=f"{value}",
        va="center",
        ha="left",
        fontsize=13,
        font=font,
        color="grey",
    )
    ax.plot([1963, 2023], [value, value], color="grey", lw=0.1)

# add title
fig_text(
    s="More than 1 natural disaster occurs\n<every day> since the 21st century",
    x=0.16,
    y=0.83,
    fontsize=24,
    ha="left",
    va="top",
    color="black",
    font=other_font,
    fig=fig,
    highlight_textprops=[{"font": other_bold_font}],
)

# source and credit
text = """
<Design>: barbierjoseph.com
<Data>: EM-DAT, CRED / UCLouvain (2024)
"""
fig_text(
    s=text,
    x=0.16,
    y=0.05,
    fontsize=10,
    ha="left",
    va="top",
    color="black",
    fontproperties=other_font,
    highlight_textprops=[{"font": other_bold_font}, {"font": other_bold_font}],
)

# add inline labels
y_pos = [330, 220, 180, 100, 70, 30, -10, -30]
for i in range(len(y_pos)):
    country = columns[::-1][i]
    val_2023 = int(df.loc[2023, country])
    ax_text(
        x=2030,
        y=y_pos[i],
        s=f"{country.upper()} - {val_2023} disasters in 2023",
        va="center",
        ha="left",
        font=other_bold_font,
        fontsize=12,
        color=colors[7 - i],
    )

# add inflexion arrows
x_axis_start = 2023
x_axis_end = 2030
radius = 10
arrow_props = {"clip_on": False, "color": "black", "fill_head": False}
ax_arrow(
    tail_position=(x_axis_start, 330), head_position=(x_axis_end, 330), **arrow_props
)
ax_arrow(
    tail_position=(x_axis_start, 220), head_position=(x_axis_end, 220), **arrow_props
)
ax_arrow(
    tail_position=(x_axis_start, 90),
    head_position=(x_axis_end, 180),
    inflection_position=(2040, 180),
    **arrow_props,
)
ax_arrow(
    tail_position=(x_axis_start, 60),
    head_position=(x_axis_end, 100),
    inflection_position=(2040, 100),
    **arrow_props,
)
ax_arrow(
    tail_position=(x_axis_start, 45),
    head_position=(x_axis_end, 70),
    inflection_position=(2040, 70),
    **arrow_props,
)
ax_arrow(
    tail_position=(x_axis_start, 30), head_position=(x_axis_end, 30), **arrow_props
)
ax_arrow(
    tail_position=(x_axis_start, 20),
    head_position=(x_axis_end, -10),
    inflection_position=(2040, -10),
    **arrow_props,
)
ax_arrow(
    tail_position=(x_axis_start, 4),
    head_position=(x_axis_end, -30),
    inflection_position=(2040, -30),
    **arrow_props,
)
plt.savefig("debug.svg")

PlotJS(fig, bbox_inches="tight").add_css(
    css.from_dict(
        {
            ".tooltip": {
                "width": "180px",
                "text-align": "center",
                "font-size": "1.2em",
                "background": "#000814",
            }
        }
    )
).add_tooltip(labels=columns).save("docs/iframes/area-natural-disasters.html")
```

<iframe width="1000" height="400" src="../../iframes/area-natural-disasters.html" style="border:none;"></iframe>

## Random walks

```python
import numpy as np
import matplotlib.pyplot as plt
from plotjs import PlotJS

size = 10000

labels = ["S&P500", "CAC40", "Bitcoin", "Livret A", "Default"]
groups = ["safe", "safe", "safe", "not safe", "not safe"]

fig, axs = plt.subplots(figsize=(10, 10), nrows=2)
axs[0].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#264653",
    label=labels[0],
)
axs[0].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#2a9d8f",
    label=labels[1],
)
axs[0].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#e9c46a",
    label=labels[2],
)
axs[0].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#0077b6",
    label=labels[3],
)
axs[0].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#14213d",
    label=labels[4],
)
axs[0].legend()

axs[1].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#264653",
    label=labels[0],
)
axs[1].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#2a9d8f",
    label=labels[1],
)
axs[1].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#e9c46a",
    label=labels[2],
)
axs[1].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#0077b6",
    label=labels[3],
)
axs[1].plot(
    np.cumsum(np.random.choice([-1, 1], size=size)),
    linewidth=5,
    color="#14213d",
    label=labels[4],
)
axs[1].legend()


(
    PlotJS(fig=fig)
    .add_tooltip(labels=labels, groups=labels, ax=axs[0])
    .add_tooltip(labels=labels, groups=labels, ax=axs[1])
    .save("docs/iframes/random-walk-1.html")
)
```

<iframe width="1000" height="800" src="../../iframes/random-walk-1.html" style="border:none;"></iframe>

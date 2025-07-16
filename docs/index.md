# `plotjs`: bridge between static matplotlib and interactive storytelling

`plotjs` is a proof of concept, inspired by [mpld3](https://github.com/mpld3/mpld3), to make matplotlib plots interactive (for the browser) with minimum user inputs.

The goal is also to give users a large customization power.

> Consider that the project is still **very unstable**.

## What it does?

What if matplotlib was interactive (with cool hover animated effects?).

But matplotlib charts are static:

```python
import matplotlib.pyplot as plt
import pandas as pd

path = "https://github.com/y-sunflower/fleur/blob/main/fleur/data/iris.csv?raw=true"
df = pd.read_csv(path)

fig, ax = plt.subplots()
ax.scatter(
    df["sepal_length"],
    df["sepal_width"],
    c=df["species"].astype("category").cat.codes,
    s=300,
    alpha=0.5,
    ec="black",
)
ax.set_xlabel("sepal_length")
ax.set_ylabel("sepal_width")
```

![](quick.png)

What if we make it interactive? In 1 line with `plotjs`, it becomes:

```python
from plotjs import interactivePlot

interactivePlot(tooltip=df["species"].to_list())
```

<iframe width="800" height="600" src="quickstart.html" style="border:none;"></iframe>

But you can make things even more advanced:

```python
df["tooltip"] = (
    "Sepal length = "
    + df["sepal_length"].astype(str)
    + "<br>"
    + "Sepal width = "
    + df["sepal_width"].astype(str)
    + "<br>"
    + df["species"].str.upper()
)

interactivePlot(
    tooltip=df["tooltip"].to_list(),
    tooltip_group=df["species"].to_list(),
).add_css(
    {"background": "red", "font-size": "30px"},
    selector=".tooltip",
)
```

<iframe width="800" height="600" src="quickstart2.html" style="border:none;"></iframe>

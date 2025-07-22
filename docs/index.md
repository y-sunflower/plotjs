# `plotjs`: bridge between static matplotlib and interactive storytelling

`plotjs` is a proof of concept, inspired by [mpld3](https://github.com/mpld3/mpld3), to make matplotlib plots interactive (for the browser) with minimum user inputs.

The goal is also to give users a large customization power.

> Consider that the project is still **very unstable**.

## What it does?

Matplotlib is **great**[^1]: you can draw anything with it.

But Matplotlib's graphics are **static**[^2], unlike those of plotly or altair, for example.

For instance, a chart made with matplotlib looks like this:

```python
# mkdocs: render
import matplotlib.pyplot as plt
from plotjs import data

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
```

This is just a png file, nothing crazy.

Wouldn't it be cool if we could, for example, have hover effects? Like, if I put my mouse on a point, it displays something?

<i><center>Introducting ✨plotjs✨</center></i>

```python
from plotjs import InteractivePlot

InteractivePlot(tooltip=df["species"])
```

<iframe width="800" height="600" src="quickstart.html" style="border:none;"></iframe>

By default, `plotjs` will highlight the hovered point and fade other points.

What if we want to highlight all points from a specie for example?

```python
InteractivePlot(
    tooltip=df["species"],
    tooltip_group=df["species"],
)
```

<iframe width="800" height="600" src="quickstart2.html" style="border:none;"></iframe>

Now, let's say we want to a _finer control_ over the hover effects.

That's easily possible with some basic CSS:

- we select `.point.hovered` to control CSS for the hovered points
- we select `.point.not-hovered` to control CSS for the un-hovered points

```python
InteractivePlot(
    tooltip=df["species"],
    tooltip_group=df["species"],
).add_css(
    {"opacity": "0.8", "fill": "red"},
    selector=".point.hovered",
)
```

<iframe width="800" height="600" src="quickstart3.html" style="border:none;"></iframe>

Now let's setup **better labels** than the current ones.

The `tooltip` argument just requires an iterable, and will use this for the labels. That means we can do pretty much whatever we want. For instance, with pandas, we can do:

```python
custom_tooltip = df.apply(
    lambda row: f"Sepal length = {row['sepal_length']}<br>"
    f"Sepal width = {row['sepal_width']}<br>"
    f"{row['species'].upper()}",
    axis=1,
)
```

Then we use this as the new tooltip:

```python
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
)
```

<iframe width="800" height="600" src="quickstart4.html" style="border:none;"></iframe>

Now that you understand the core components of `plotjs`, let's see how it looks with a line chart.

It turns out that it's always the same thing:

```python
import numpy as np

walk1 = np.cumsum(np.random.choice([-1, 1], size=500))
walk2 = np.cumsum(np.random.choice([-1, 1], size=500))
walk3 = np.cumsum(np.random.choice([-1, 1], size=500))

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(walk1, linewidth=8, color="#264653")
ax.plot(walk2, linewidth=8, color="#2a9d8f")
ax.plot(walk3, linewidth=8, color="#e9c46a")

InteractivePlot(
    tooltip=["S&P500", "CAC40", "Bitcoin"]
)
```

<iframe width="800" height="400" src="quickstart5.html" style="border:none;"></iframe>

How about a barplot?

```python
fig, ax = plt.subplots()
ax.barh(
    ["Fries", "Cake", "Apple", "Cheese"],
    [10, 30, 40, 50],
    height=0.6,
    color=["#ef476f", "#ffd166", "#06d6a0", "#118ab2"],
)

InteractivePlot(
    tooltip=["Fries", "Cake", "Apple", "Cheese"],
    tooltip_group=["Good", "Good", "Bad", "Good"],
).add_css(
    {
        "width": "100px",
        "text-align": "center",
        "font-size": "1.1em",
    },
    selector=".tooltip",
)
```

<iframe width="800" height="600" src="quickstart6.html" style="border:none;"></iframe>

Connect legend and plot elements:

=== "Scatter plot"

    ```python
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

    InteractivePlot(
        fig=fig,
        tooltip_group=df["species"],
    )
    ```

    <iframe width="800" height="600" src="quickstart7.html" style="border:none;"></iframe>

=== "Line chart"

    ```python
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

    InteractivePlot(
        tooltip=labels,
        tooltip_group=labels,
    )
    ```

    <iframe width="800" height="600" src="quickstart8.html" style="border:none;"></iframe>

This is just a basic overview of things you can do with `plotjs`. There is a lot more coming.

## Appendix

[^1]: It really is.
[^2]: To be exact, you can perfectly create interactive charts natively in Matplotlib. It requires to use its interactive mode and GUI backends to allow actions like zooming and panning in desktop windows. For instance, this differs from Plotly or Altair, which offer richer, browser-based interactivity like tooltips and filtering. Matplotlib’s interactivity is more limited and environment-dependent, while Plotly and Altair provide higher-level, web-friendly features.

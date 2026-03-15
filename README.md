# `plotjs`: Turn static matplotlib charts into interactive web visualizations

<img src="https://github.com/JosephBARBIERDARNAL/static/blob/main/python-libs/plotjs/image.png?raw=true" alt="plotjs logo" align="right" width="150px"/>

`plotjs` is a Python package that transform matplotlib plots into interactive charts with minimum user inputs. You can:

- control tooltip labels and grouping
- add CSS
- add JavaScript
- and many more

> Consider that the project is still **very unstable**.

[Online demo](https://y-sunflower.github.io/plotjs/)

<br><br>

## Installation

From PyPI (recommended):

```
pip install plotjs
```

Latest dev version:

```
pip install git+https://github.com/y-sunflower/plotjs.git
```

If you use `uv`:

```bash
uv add plotjs
```

## Why `plotjs`?

`plotjs` keeps your existing matplotlib workflow and adds interactivity on top of the SVG that matplotlib already knows how to generate. Instead of rebuilding the chart in another library, you keep the same `Figure`, export it to HTML, and control the browser-side behavior with CSS and JavaScript.

## Features Overview

- Keep your existing matplotlib figure and export it as a standalone interactive HTML file
- Add hover tooltips from any iterable of labels
- Highlight related elements together with `groups=...`
- Support scatter, line, bar, and area charts
- Restrict interactivity to specific element types with `on=...`
- Use direct hover or nearest-element hover with `hover_nearest=True`
- Add custom CSS with strings, dictionaries, or files
- Add custom JavaScript with strings or files, and optionally load D3.js
- Work with multiple matplotlib axes in the same figure
- Export either to disk with `save()` or to an HTML string with `as_html()`

## Quickstart

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()

fig, ax = plt.subplots()
ax.scatter(
    df["sepal_length"],
    df["sepal_width"],
    c=df["species"].astype("category").cat.codes,
    s=180,
    alpha=0.6,
    ec="black",
)

(
    PlotJS(fig)
    .add_tooltip(labels=df["species"])
    .save("iris-scatter.html")
)
```

Open `iris-scatter.html` in your browser to get hover tooltips and default highlight/fade behavior.

## Reprex

### 1. Group hover by category

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()

fig, ax = plt.subplots()
ax.scatter(
    df["petal_length"],
    df["petal_width"],
    c=df["species"].astype("category").cat.codes,
    s=180,
    alpha=0.6,
    ec="black",
)

(
    PlotJS(fig)
    .add_tooltip(
        labels=df["species"],
        groups=df["species"],
    )
    .save("iris-grouped.html")
)
```

All points from the same species will highlight together.

### 2. Customize the tooltip and hover state with CSS

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()
labels = df.apply(
    lambda row: (
        f"{row['species']}<br>"
        f"petal_length = {row['petal_length']}<br>"
        f"petal_width = {row['petal_width']}"
    ),
    axis=1,
)

fig, ax = plt.subplots()
ax.scatter(
    df["petal_length"],
    df["petal_width"],
    c=df["species"].astype("category").cat.codes,
    s=180,
    alpha=0.6,
    ec="black",
)

(
    PlotJS(fig)
    .add_tooltip(
        labels=labels,
        groups=df["species"],
        hover_nearest=True,
        on="point",
    )
    .add_css(
        from_dict={
            ".tooltip": {
                "background": "#111827",
                "color": "white",
                "font-size": "0.95rem",
                "text-align": "center",
            },
            ".point.hovered": {
                "stroke": "#111827",
                "stroke-width": "2px",
            },
            ".point.not-hovered": {
                "opacity": "0.25",
            },
        }
    )
    .save("iris-custom.html")
)
```

### 3. Add interactivity to multiple axes

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()
colors = df["species"].astype("category").cat.codes

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))

ax1.scatter(
    df["sepal_length"],
    df["sepal_width"],
    c=colors,
    s=120,
    alpha=0.6,
    ec="black",
)
ax2.scatter(
    df["petal_length"],
    df["petal_width"],
    c=colors,
    s=120,
    alpha=0.6,
    ec="black",
)

(
    PlotJS(fig)
    .add_tooltip(labels=df["species"], groups=df["species"], ax=ax1)
    .add_tooltip(labels=df["species"], groups=df["species"], ax=ax2)
    .save("iris-two-axes.html")
)
```

### 4. Embed the chart elsewhere with `as_html()`

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()

fig, ax = plt.subplots()
ax.scatter(df["sepal_length"], df["sepal_width"])

html = (
    PlotJS(fig)
    .add_tooltip(labels=df["species"])
    .as_html()
)
```

This is useful for environments like marimo, or for embedding the output in your own app or webpage.

## Supported Plot Elements

`plotjs` currently detects these matplotlib SVG elements:

- Scatter points
- Lines
- Bars
- Filled areas

These are also the main selectors you can target from CSS or JavaScript:

- `.point`
- `.line`
- `.bar`
- `.area`
- `.plot-element`
- `.tooltip`
- `svg`

## Important Limitation

The order in which matplotlib draws elements must match the order of your `labels` and `groups`.

If you plot data in chunks or loops, make sure the tooltip arrays follow the exact same order. When possible, plotting all elements at once is the safest option.

## How It Works

1. `plotjs` saves your matplotlib `Figure` as SVG.
2. It injects that SVG, your tooltip metadata, and optional CSS/JavaScript into an HTML template.
3. In the browser, JavaScript parses the SVG DOM and attaches hover effects, tooltips, and grouping behavior.

## Documentation

- [Getting started](docs/index.md)
- [PlotJS API reference](docs/reference/plotjs.md)
- [CSS guide](docs/guides/css/index.md)
- [JavaScript guide](docs/guides/javascript/index.md)
- [Embedding in Quarto, marimo, or websites](docs/guides/embed-graphs/index.md)
- [Troubleshooting](docs/guides/troubleshooting/index.md)
- [Developer architecture overview](docs/developers/overview.md)

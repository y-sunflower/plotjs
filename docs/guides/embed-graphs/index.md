Most of the time you'll want to embed your interactive chart into an app or a website. For this purpose, `plotjs` offers a few utility tools to make this easy, depending on the tool you're using.

## Quarto

The simplest way to embed your plot in [Quarto](https://quarto.org/) is to save it as an HTML file, and then add an <iframe\> below.

````md
---
title: Plotjs in a Quarto document
---

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

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
   .save("plot.html")
)
```

<iframe width="800" height="600" src="plot.html" style="border:none;"></iframe>
````

## Marimo

In [marimo](https://marimo.io/), you'll also want to create an iframe, but using the built-in `mo.iframe()` function instead. This function requires an HTML string that we can get with the `as_html()` function from `plotjs`.

```python
import marimo as mo
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

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

html_plot = (
   PlotJS(fig=fig)
   .add_tooltip(labels=df["species"])
   .as_html()
)

mo.iframe(html_plot)
```

## Any website

You can embed an interactive plot in any website by using <iframe\>. For instance, a minimalist page of a website could look like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Minimalist Iframe Page</title>
  </head>
  <body>
    <iframe src="plot.html"></iframe>
  </body>
</html>
```

Here it assumes that "plot.html" is a file that you have locally.

It can also be from a remote location:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Minimalist Iframe Page</title>
  </head>
  <body>
    <iframe src="https://yourdomain.com/plot.html"></iframe>
  </body>
</html>
```

## Jupyter

It currently does not work in Jupyter environments such as Jupyter notebooks and Jupyter labs, and is not considered to be a high priority. Unless many people ask for it, it's not planned to be implemented in a near future.

But if you want to implement it yourself, PRs welcome!

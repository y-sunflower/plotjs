Since `plotjs` does many things via JavaScript (e.g., in your browser when you open your HTML file), you may easily encounter "silent" errors.

In practice, you will run your Python and everything will seem fine, but that does not mean what you'll see in the output is what you expected. There may be multiple reasons for this. Here I'll explain common things that can happen, and how to debug them.

## Developer tools

Your browser has a thing called developer tools. It allows you to view many things, but here we're mostly interested in its "console" section.

The console displays all the messages, including error messages, that the web page encountered at some point. Many of them are not necessarily interesting and are standard messages, but some of them might come from `plotjs` doing something wrong.

How to open the developer tools is browser-specific, but there's likely a shortcut to make it convenient. For instance, on macOS + Firefox I use ++option+cmd+i++.

Once open, you'll also be able to find messages from `plotjs`, such as the number of "points" (scatter plot) or "lines" (line plot) that have been found. This can give you clues as to what's going wrong.

## Debug `plotjs`

### Workflow

Since currently `plotjs` can't (yet) really be displayed in tools like Jupyter notebooks, marimo, etc., you have to open the output HTML file in your browser.

In order to have a comfortable workflow, it's recommended to have [`live-server`](https://www.npmjs.com/package/live-server) installed on your machine for automatic reload on file changes. Assuming you name your HTML file `mychart.html`, you'll just have to run `live-server mychart.html` and it'll open your plot in your default browser. Every time `mychart.html` is updated, it'll refresh the page. This makes debugging and iterating much faster and easier.

### Debugging

If you don't see what you expect in your chart, the first thing to do is to check the console. If you see any error message in it, that might be related to why it's not working as expected.

If you added your own CSS/JavaScript, make sure that:

- they use valid selectors
- they are actually included in the HTML page

## Invalid hovered elements

You may encounter a bug in which the elements of the graph you hover over appear random. The main reason is probably that **the plot order and `labels`/`groups` arguments are not the same**.

You can learn more about how to fix this [here](../../index.md#important-limitation).

## Using LLMs

### Send HTML output

Depending on the size of your HTML output, you can try dumping everything into chatGPT (or your favorite LLM) and asking why there's unwanted behavior. The main limitation will be the maximum context size accepted by your LLM.

### Prompt

If you want to give more context about `plotjs` to the LLM, you can use the following prompt to give it the most important info.

````md
plotjs is a new Python package that aims to convert matplotlib charts into web-based visualization. It works by parsing the SVG output with javascript to automatically detect what is a point from a scatter plot, a line from a line chart etc, with minimum user inputs.

Here are some code snippets to help you understand how to use it. Assuming we have a chart like this:

```py
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

- minimalist usage (labels can be any kind of iterable and series):

```py
from plotjs import PlotJS

PlotJS(fig=fig).add_tooltip(
    labels=df["species"],
).save("index.html")
```

- group the hover effect by specie (groups can be any kind of iterable and series):

```py
from plotjs import PlotJS

(
    PlotJS(fig=fig)
    .add_tooltip(
        labels=df["species"],
        groups=df["species"],
    )
    .save("index.html")
)
```

- add CSS

```py
from plotjs import PlotJS

(
    PlotJS(fig=fig)
    .add_tooltip(
        labels=df["species"],
        groups=df["species"],
    )
    .add_css(".hovered{fill: blue !important;}")
    .save("index.html")
)
```

- you can also work with multiple Axes, assuming you explicit which Axes to use (it uses plt.gca() otherwise):

```py
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))

args = dict(
    c=df["species"].astype("category").cat.codes,
    s=300,
    alpha=0.5,
    ec="black",
)
ax1.scatter(df["sepal_width"], df["sepal_length"], **args)
ax2.scatter(df["petal_width"], df["petal_length"], **args)

(
    PlotJS(fig)
    .add_tooltip(
        groups=df["species"],
        ax=ax1,  # left Axes
    )
    .add_tooltip(
        labels=df["species"],
        ax=ax2,  # right Axes
    )
    .save("index.html")
)
```

- Add javascript

```py
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
)
```

If you're able to browse the web, you can find the complete documentation here: https://y-sunflower.github.io/plotjs/ and a guide on how to troubleshoot here: https://y-sunflower.github.io/plotjs/guides/troubleshooting/.

Currently, plotjs does not really work with Jupyter, but well with Quarto (using iframes), marimo:

```py
html_plot = (
   PlotJS(fig=fig)
   .add_tooltip(labels=df["species"])
   .as_html()
)

mo.iframe(html_plot)
```

Currently, using plotjs with seaborn might lead to unexpected behavior, and there is not easy fix for users.

## Selectable elements

To style or add interactivity, you need to select elements using the DOM[^1]. These are the most common selectors:

### Plot elements

- `.point`: scatter plot points
- `.line`: line chart lines
- `.area`: area chart fills
- `.bar`: bar chart bars
- `.plot-element`: all of the above

You can combine with `.hovered` or `.not-hovered`, e.g., `.point.hovered`.

### Misc

- `.tooltip`: tooltip shown on hover
- `svg`: the entire SVG element
````

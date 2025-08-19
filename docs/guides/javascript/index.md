Under the hood, JavaScript is what is used to make the charts interactive. But `plotjs` allows anyone to add some more JavaScript for finer control of what is happening and basically do whatever you want!

## Basic example

Try to click on one of the points in the chart!

```python
import matplotlib.pyplot as plt
from plotjs import data, PlotJS

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
    .add_javascript(
        """
d3.selectAll(".point").on("click", () =>
  alert("I wish cookies were 0 calories...")
);
"""
    )
)
```

<iframe width="800" height="600" src="../../iframes/javascript.html" style="border:none;"></iframe>

Relevant code here is:

```js
d3.selectAll(".point").on("click", () =>
  alert("I wish cookies were 0 calories...")
);
```

Here’s what it does:

- selects all points (e.g., from the scatter plot)
- sets that when clicking one of the points
- it displays a message

## Loading JavaScript from file

`plotjs` requires the JavaScript to be in a string, but it's far from being a comfortable way of coding. So there is a convenient function to load JavaScript from a file:

```python
from plotjs import javascript

PlotJS(fig=fig).add_javascript(
    javascript.from_file("my_script.js"),
)
```

This allows you to write JavaScript in a separate file so that you can have a code formatter (prettier, etc.), code completion, syntax highlighting, and so on. This is what is recommended to do if you're writing a significant amount of code.

## Advanced usage

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

df = data.load_iris()

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

custom_js: str = """
document.querySelectorAll('.point').forEach(el => {
el.addEventListener('click', function() {
    const group = this.getAttribute('data-group');

    // Toggle logic
    const active = this.classList.contains('clicked');
    document.querySelectorAll('.point').forEach(p => {
    p.classList.remove('clicked');
    p.classList.remove('dimmed');
    });

    if (!active) {
    this.classList.add('clicked');
    document.querySelectorAll('.point').forEach(p => {
        if (p.getAttribute('data-group') !== group) {
        p.classList.add('dimmed');
        }
    });
    }
});
});
"""

custom_css: str = """
.point.dimmed {
    opacity: 0.2;
}
.point.clicked {
    stroke-width: 3px;
}
"""

(
    PlotJS(fig=fig)
    .add_tooltip(
        labels=df["species"],
        groups=df["species"],
    )
    .add_css(custom_css)
    .add_javascript(custom_js)
)
```

<iframe width="800" height="600" src="../../iframes/javascript2.html" style="border:none;"></iframe>

## Elements to select

In order to apply [CSS](../css/index.md) or JavaScript, you need to select elements from the DOM[^1]. You can find most of them using the [inspector](../troubleshooting/index.md) of your browser. All the common ones are defined below:

#### Plot elements

- `.point`: all points from a scatter plot
- `.line`: all lines from a line chart
- `.area`: all areas from an area chart
- `.bar`: all bars from a bar chart
- `.plot-element`: all previous elements (points, lines, areas, and bars)

For all of those previous elements, you can add `.hovered` or `.not-hovered` (e.g., `.point.not-hovered`) to, respectively, select currently hovered and not-hovered elements.

#### Misc

- `.tooltip`: the tooltip displayed when hovering elements
- `svg`: the entire SVG containing the chart

???+ question

    Something's missing? Please [tell me](https://github.com/y-sunflower/plotjs/issues) about it by opening a new issue!

## Appendix

[^1]: The DOM (Document Object Model) is a tree-like structure that represents all the elements of a web page, allowing JavaScript to read, change, and interact with them. Think of it as a live map of the webpage that your code can explore and update in real time.

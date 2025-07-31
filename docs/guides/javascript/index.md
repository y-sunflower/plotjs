Under the hood, JavaScript is what is used to make the charts interactive. But `plotjs` allows anyone to add some more JavaScript for a finer control of what is happening and basically do whatever you want!

## Basic example

Try to click on one of the point in the chart!

```python
import matplotlib.pyplot as plt
from plotjs import data, MagicPlot

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

MagicPlot(fig=fig).add_tooltip(
    labels=df["species"],
).add_javascript(
    """
d3.selectAll(".point").on("click", () =>
  alert("I wish cookies were 0 calories...")
);
"""
).save("docs/guides/javascript/javascript.html")
```

<iframe width="800" height="600" src="javascript.html" style="border:none;"></iframe>

Relevant code here is:

```js
d3.selectAll(".point").on("click", () =>
  alert("I wish cookies were 0 calories...")
);
```

Here what it does:

- select all points (e.g, from the scatter plot)
- sets that when clicking one of the point
- it displays a message

## Loading JavaScript from file

`plotjs` requires the JavaScript to be in a string, but it's far from being a comfortable way of coding. So there is a convenient function to load JavaScript from a file:

```python
from plotjs import javascript

MagicPlot(fig=fig).add_javascript(
    javascript.from_file("my_script.js"),
)
```

This allows you to write JavaScript in a separate file so that you can have a code formatter (prettier, etc), code completion, syntax highlighting, and so on. This is what is recommended to do if you're writing a significant amount of code.

## Advanced usage

```python
import matplotlib.pyplot as plt
from plotjs import MagicPlot, data

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
    MagicPlot(fig=fig)
    .add_tooltip(
        labels=df["species"],
        groups=df["species"],
    )
    .add_css(custom_css)
    .add_javascript(custom_js)
    .save("docs/guides/javascript/javascript2.html")
)
```

<iframe width="800" height="600" src="javascript2.html" style="border:none;"></iframe>

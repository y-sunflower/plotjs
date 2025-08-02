With `plotjs`, you can add your own CSS for advanced plot customization. Let's see how it works.

## Understanding CSS

CSS requires 2 things:

- a selector: which elements should receive the style
- a list of key-value pairs, where keys are the attribute we want to set and value the value for this attribute.

A minimalist CSS code would be:

```CSS
.tooltip {
   background: red;
   color: blue;
}
```

Here we basically say _"To all objects of the class `tooltip`, set the `background` to `red` and the text `color` to `blue`."_

Now let's add this CSS to our plot to change the tooltip:

```python
(
    MagicPlot()
    .add_tooltip(labels=df["tooltip"])
    .add_css(".tooltip {background: red; color: blue;}")
)
```

<iframe width="800" height="600" src="css.html" style="border:none;"></iframe>

> Note that this does not require any indentation, contrary to Python. We can write CSS with a single line of code.

## Pass CSS as a Python dictionnary

Being able to pass CSS inside a string is convenient, but not very readable when you want to pass a lot of CSS.

One option that you can use is to define your CSS via dictionnary. For this we need to import the css module from `plotjs`.

```python
from plotjs import css

(
    MagicPlot()
    .add_tooltip(labels=df["tooltip"])
    .add_css(css.from_dict({".tooltip": {"background": "red", "color": "blue"}}))
)
```

Since `add_css()` returns the instance itself, you can do method chaining:

```python
(
    MagicPlot()
    .add_tooltip(
        labels=df["tooltip"],
    )
    .add_css(css.from_dict({".tooltip": {"color": "blue"}}))
    .add_css(css.from_dict({".tooltip": {"background": "red"}}))
)
```

## Pass a CSS file

Finally, if your CSS is in a CSS file, you can use `css.from_file()`. Assuming your CSS file looks like this:

```CSS
.tooltip {
  background: pink;
  color: yellow;
}
```

We now do:

```python
(
    MagicPlot()
    .add_tooltip(labels=df["tooltip"])
    .add_css(css.from_file("docs/static/style.css"))
)
```

<iframe width="800" height="600" src="css-2.html" style="border:none;"></iframe>

## Elements to select

In order to apply CSS or [JavaScript](../javascript/index.md), you need to select elements from the DOM[^1]. You can find most of them using the [inspector](../troubleshooting/index.md) of your browser. All the common ones are defined below:

#### Plot elements

- `.point`: all points from a scatter plot
- `.line`: all lines from a line chart
- `.area`: all areas from an area chart
- `.bar`: all bars from a bar chart
- `.plot-element`: all previous elements (points, lines, areas and bars)

For all of those previous elements, you can add `.hovered` or `.not-hovered` (e.g, `.point.not-hovered`) to, respectively, select currently hovered and not hovered elements.

#### Misc

- `.tooltip`: the tooltip displayed when hovering elements
- `svg`: the entire SVG containing the chart

???+ question

    Something's missing? Please [tell me](https://github.com/y-sunflower/plotjs/issues) about it by opening a new issue!

## Appendix

[^1]: The DOM (Document Object Model) is a tree-like structure that represents all the elements of a web page, allowing JavaScript to read, change, and interact with them. Think of it as a live map of the webpage that your code can explore and update in real time.

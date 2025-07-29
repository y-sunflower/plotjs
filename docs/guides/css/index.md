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
MagicPlot(
   tooltip=df["tooltip"],
).add_css(".tooltip {background: red; color: blue;}")
```

<iframe width="800" height="600" src="CSS.html" style="border:none;"></iframe>

> Note that this does not require any indentation, contrary to Python. We can write CSS with a single line of code.

## Pass CSS as a Python dictionnary

Being able to pass CSS inside a string is convenient, but not very readable when you want to pass a lot of CSS.

One option that you can use is to define your CSS via dictionnary. For this we need to import the css module from `plotjs`.

```python
from plotjs import css

MagicPlot(
    tooltip=df["tooltip"],
).add_css(
    css.from_dict({".tooltip": {"background": "red", "color": "blue"}}),
)
```

Since `add_css()` returns the instance itself, you can do method chaining:

```python
MagicPlot(
    tooltip=df["tooltip"],
).add_css(
    {".tooltip": {"color": "blue"}}
).add_css(
    {".tooltip": {"background": "red"}}
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
MagicPlot(
    tooltip=df["tooltip"],
).add_css(css.from_file("style.css"))
```

<iframe width="800" height="600" src="CSS-2.html" style="border:none;"></iframe>

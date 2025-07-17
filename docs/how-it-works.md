Transforming a static plot into something that you can interact with can't be done (unfortunately) just by saying "make this interactive".

But that does not mean we have to do mystic things to make it to work, because, **yes** that's perfectly possible without weird hacking stuff.

## Overview

There are 2 ways to tackle this problem:

- Take a matplotlib Figure (instance containing all plot elements) and convert it to a more common format such as json. Then, with this json file, we recreate the figure with an interactive tool such as D3.js (that's what [mpld3](https://github.com/mpld3/mpld3) does btw!).
- Use native matplotlib figure output format (especially SVG) and parse this instead (that's what `plotjs` does).

The second option is **much simpler** (well, it depends) because we don't have to

- translate the figure to JSON (which can be painfully complex if you want to handle all egde cases and make it robust).
- recreate the chart: browsers can display SVG perfectly.

But it means that we don't have full control over how the plot is structured (from the browser point of view). We need to find a way to parse this SVG.

## Parsing SVG

For the moment, we just take user's matplotlib figure and save it as SVG. This is just:

```python
fig.savefig("user_plot.svg")
```

Now let's say the Figure contains a scatterplot we want to add a tooltip: when someone passes his mouth over a point, it displays a label.

The **core problem to solve** is: "how do I know what elements from the SVG are points"?

If we're able to find a solution to this, then we're able to do pretty much **anything we want**.

The thing is that, there's nothing in the SVG output file that tells us "this element is a point from the scatter plot". **Even worse**: we don't even know if that's a scatter plot or something completly unrelated like a choropleth map.

For example, here is a polygon of a choropleth map:

```svg
<path d="M -5.94098 449.279178
L -4.961244 447.127034
L -4.623284 444.786333
L -3.951831 442.584471
L -5.459995 439.551953
L -5.763812 436.050818
L -3.764043 431.650797
L -2.459548 432.213824
L 0.368893 433.425033
L 4.436122 437.74466
L 5.072043 439.840475
L 2.799722 444.523728
L 1.620088 448.292228
L 0.147953 450.236113
L -1.691322 450.601856
L -2.215184 449.161231
L -3.074426 448.947286
L -4.263489 450.334887
z
" clip-path="url(#pf43ab1627f)" style="fill: #424186"/>
```

Here is a point from a scatter plot:

```svg
<use
   xlink:href="#m81e2893e84"
   x="145.978182"
   y="144.288"
   style="fill: #1f77b4;
   stroke: #1f77b4"
/>
```

Here is a line from a line chart:

```svg
<g id="line2d_19">
   <path d="M 73.832727 295.488
L 154.996364 235.008
L 236.16 174.528
L 317.323636 114.048
L 398.487273 53.568
"
   clip-path="url(#pd511a61f39)"
   style="fill: none;
   stroke: #1f77b4;
   stroke-width: 1.5;
   stroke-linecap: square" />
</g>
```

If you pay close attention, you'll see potential patterns in the structure of certain elements.

That's exactly what we'll use to determine what kind of plot elements we have. I'm not gonna detail them here because it's not particularly interesting, but feel free to browse the [source code](https://github.com/y-sunflower/plotjs/blob/main/plotjs/static/template.html){target="\_blank"} if you're curious.

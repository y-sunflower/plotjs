## Functions

<dl>
<dt><a href="#findBars">findBars(svg, axes_class)</a> ⇒ <code>d3.Selection</code></dt>
<dd><p>Find bar elements (<code>patch</code> groups with clipping) inside a given axes.</p>
</dd>
<dt><a href="#findPoints">findPoints(svg, axes_class, tooltip_groups)</a> ⇒ <code>d3.Selection</code></dt>
<dd><p>Find scatter plot points inside a given axes.
Handles both <code>&lt;use&gt;</code> and <code>&lt;path&gt;</code> fallback cases,
and assigns <code>data-group</code> attributes based on tooltip groups.</p>
</dd>
<dt><a href="#findLines">findLines(svg, axes_class)</a> ⇒ <code>d3.Selection</code></dt>
<dd><p>Find line elements (<code>line2d</code> paths) inside a given axes,
excluding axis grid lines.</p>
</dd>
<dt><a href="#findAreas">findAreas(svg, axes_class)</a> ⇒ <code>d3.Selection</code></dt>
<dd><p>Find filled area elements (<code>FillBetweenPolyCollection</code> paths) inside a given axes.</p>
</dd>
<dt><a href="#nearestElementFromMouse">nearestElementFromMouse(mouseX, mouseY, elements)</a> ⇒ <code>Element</code> | <code>null</code></dt>
<dd><p>Compute the nearest element to the mouse cursor from a set of elements.
Uses bounding box centers for distance.
This function is used when the <code>hover_nearest</code> argument is true.</p>
</dd>
<dt><a href="#setHoverEffect">setHoverEffect(plot_element, axes_class, tooltip_labels, tooltip_groups, show_tooltip, hover_nearest)</a></dt>
<dd><p>Attach hover interaction and tooltip display to plot elements.
Can highlight nearest element (if enabled) or hovered element directly.</p>
</dd>
</dl>

<a name="findBars"></a>

## findBars(svg, axes_class) ⇒ <code>d3.Selection</code>
Find bar elements (`patch` groups with clipping) inside a given axes.

**Kind**: global function
**Returns**: <code>d3.Selection</code> - D3 selection of bar elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | <code>d3.Selection</code> | D3 selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group (e.g. "axes_1"). |

<a name="findPoints"></a>

## findPoints(svg, axes_class, tooltip_groups) ⇒ <code>d3.Selection</code>
Find scatter plot points inside a given axes.
Handles both `<use>` and `<path>` fallback cases,
and assigns `data-group` attributes based on tooltip groups.

**Kind**: global function
**Returns**: <code>d3.Selection</code> - D3 selection of point elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | <code>d3.Selection</code> | D3 selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group (e.g. "axes_1"). |
| tooltip_groups | <code>Array.&lt;string&gt;</code> | Group identifiers for tooltips, parallel to points. |

<a name="findLines"></a>

## findLines(svg, axes_class) ⇒ <code>d3.Selection</code>
Find line elements (`line2d` paths) inside a given axes,
excluding axis grid lines.

**Kind**: global function
**Returns**: <code>d3.Selection</code> - D3 selection of line elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | <code>d3.Selection</code> | D3 selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group. |

<a name="findAreas"></a>

## findAreas(svg, axes_class) ⇒ <code>d3.Selection</code>
Find filled area elements (`FillBetweenPolyCollection` paths) inside a given axes.

**Kind**: global function
**Returns**: <code>d3.Selection</code> - D3 selection of area elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | <code>d3.Selection</code> | D3 selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group. |

<a name="nearestElementFromMouse"></a>

## nearestElementFromMouse(mouseX, mouseY, elements) ⇒ <code>Element</code> \| <code>null</code>
Compute the nearest element to the mouse cursor from a set of elements.
Uses bounding box centers for distance.
This function is used when the `hover_nearest` argument is true.

**Kind**: global function
**Returns**: <code>Element</code> \| <code>null</code> - The nearest DOM element or `null`.

| Param | Type | Description |
| --- | --- | --- |
| mouseX | <code>number</code> | X coordinate of the mouse relative to SVG. |
| mouseY | <code>number</code> | Y coordinate of the mouse relative to SVG. |
| elements | <code>d3.Selection</code> | Selection of candidate elements. |

<a name="setHoverEffect"></a>

## setHoverEffect(plot_element, axes_class, tooltip_labels, tooltip_groups, show_tooltip, hover_nearest)
Attach hover interaction and tooltip display to plot elements.
Can highlight nearest element (if enabled) or hovered element directly.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| plot_element | <code>d3.Selection</code> | Selection of plot elements (points, lines, etc.). |
| axes_class | <code>string</code> | ID of the axes group. |
| tooltip_labels | <code>Array.&lt;string&gt;</code> | Tooltip labels for each element. |
| tooltip_groups | <code>Array.&lt;string&gt;</code> | Group identifiers for each element. |
| show_tooltip | <code>&quot;block&quot;</code> \| <code>&quot;none&quot;</code> | Whether to display tooltips. |
| hover_nearest | <code>boolean</code> | If true, highlight nearest element instead of hovered one. |

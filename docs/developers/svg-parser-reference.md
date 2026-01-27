## Classes

<dl>
<dt><a href="#Selection">Selection</a></dt>
<dd><p>Lightweight Selection wrapper that mimics d3-selection&#39;s chainable API.
Provides basic DOM manipulation methods for working with SVG elements.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#select">select(selector)</a> ⇒ <code><a href="#Selection">Selection</a></code></dt>
<dd><p>Create a Selection from a DOM element or selector string.</p>
</dd>
<dt><a href="#getPointerPosition">getPointerPosition(event, svgElement)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Get mouse position relative to an SVG element.</p>
</dd>
<dt><a href="#findBars">findBars(svg, axes_class)</a> ⇒ <code><a href="#Selection">Selection</a></code></dt>
<dd><p>Find bar elements (<code>patch</code> groups with clipping) inside a given axes.</p>
</dd>
<dt><a href="#findPoints">findPoints(svg, axes_class, tooltip_groups)</a> ⇒ <code><a href="#Selection">Selection</a></code></dt>
<dd><p>Find scatter plot points inside a given axes.
Handles both <code>&lt;use&gt;</code> and <code>&lt;path&gt;</code> fallback cases,
and assigns <code>data-group</code> attributes based on tooltip groups.</p>
</dd>
<dt><a href="#findLines">findLines(svg, axes_class)</a> ⇒ <code><a href="#Selection">Selection</a></code></dt>
<dd><p>Find line elements (<code>line2d</code> paths) inside a given axes,
excluding axis grid lines.</p>
</dd>
<dt><a href="#findAreas">findAreas(svg, axes_class)</a> ⇒ <code><a href="#Selection">Selection</a></code></dt>
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

<a name="Selection"></a>

## Selection
Lightweight Selection wrapper that mimics d3-selection's chainable API.
Provides basic DOM manipulation methods for working with SVG elements.

**Kind**: global class
<a name="select"></a>

## select(selector) ⇒ [<code>Selection</code>](#Selection)
Create a Selection from a DOM element or selector string.

**Kind**: global function
**Returns**: [<code>Selection</code>](#Selection) - New Selection instance

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> \| <code>Element</code> | CSS selector string or DOM element |

<a name="getPointerPosition"></a>

## getPointerPosition(event, svgElement) ⇒ <code>Array.&lt;number&gt;</code>
Get mouse position relative to an SVG element.

**Kind**: global function
**Returns**: <code>Array.&lt;number&gt;</code> - [x, y] coordinates relative to the SVG

| Param | Type | Description |
| --- | --- | --- |
| event | <code>MouseEvent</code> | The mouse event |
| svgElement | <code>Element</code> \| [<code>Selection</code>](#Selection) | The SVG element or Selection |

<a name="findBars"></a>

## findBars(svg, axes_class) ⇒ [<code>Selection</code>](#Selection)
Find bar elements (`patch` groups with clipping) inside a given axes.

**Kind**: global function
**Returns**: [<code>Selection</code>](#Selection) - Selection of bar elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | [<code>Selection</code>](#Selection) | Selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group (e.g. "axes_1"). |

<a name="findPoints"></a>

## findPoints(svg, axes_class, tooltip_groups) ⇒ [<code>Selection</code>](#Selection)
Find scatter plot points inside a given axes.
Handles both `<use>` and `<path>` fallback cases,
and assigns `data-group` attributes based on tooltip groups.

**Kind**: global function
**Returns**: [<code>Selection</code>](#Selection) - Selection of point elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | [<code>Selection</code>](#Selection) | Selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group (e.g. "axes_1"). |
| tooltip_groups | <code>Array.&lt;string&gt;</code> | Group identifiers for tooltips, parallel to points. |

<a name="findLines"></a>

## findLines(svg, axes_class) ⇒ [<code>Selection</code>](#Selection)
Find line elements (`line2d` paths) inside a given axes,
excluding axis grid lines.

**Kind**: global function
**Returns**: [<code>Selection</code>](#Selection) - Selection of line elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | [<code>Selection</code>](#Selection) | Selection of the SVG element. |
| axes_class | <code>string</code> | ID of the axes group. |

<a name="findAreas"></a>

## findAreas(svg, axes_class) ⇒ [<code>Selection</code>](#Selection)
Find filled area elements (`FillBetweenPolyCollection` paths) inside a given axes.

**Kind**: global function
**Returns**: [<code>Selection</code>](#Selection) - Selection of area elements.

| Param | Type | Description |
| --- | --- | --- |
| svg | [<code>Selection</code>](#Selection) | Selection of the SVG element. |
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
| elements | [<code>Selection</code>](#Selection) | Selection of candidate elements. |

<a name="setHoverEffect"></a>

## setHoverEffect(plot_element, axes_class, tooltip_labels, tooltip_groups, show_tooltip, hover_nearest)
Attach hover interaction and tooltip display to plot elements.
Can highlight nearest element (if enabled) or hovered element directly.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| plot_element | [<code>Selection</code>](#Selection) | Selection of plot elements (points, lines, etc.). |
| axes_class | <code>string</code> | ID of the axes group. |
| tooltip_labels | <code>Array.&lt;string&gt;</code> | Tooltip labels for each element. |
| tooltip_groups | <code>Array.&lt;string&gt;</code> | Group identifiers for each element. |
| show_tooltip | <code>&quot;block&quot;</code> \| <code>&quot;none&quot;</code> | Whether to display tooltips. |
| hover_nearest | <code>boolean</code> | If true, highlight nearest element instead of hovered one. |

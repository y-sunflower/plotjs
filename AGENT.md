# PlotJS - LLM Reference Guide

## Project Overview

PlotJS is a Python package that transforms static matplotlib charts into interactive web visualizations. It exports matplotlib figures as SVG, parses them with JavaScript, and adds browser-based interactivity (tooltips, hover effects, grouping) without requiring chart re-serialization.

**Core Philosophy:** Leverage matplotlib's native SVG output + JavaScript DOM manipulation instead of recreating charts in D3/Altair.

## Quick Architecture

```
Matplotlib Figure → SVG Export (Python) → HTML Template (Jinja2) → Interactive Browser
```

### Workflow:

1. **Python (PlotJS class):** Captures matplotlib figure as SVG string, collects tooltip/styling metadata
2. **Jinja2 Template:** Injects SVG + CSS + JavaScript parser + configuration into HTML
3. **Browser (PlotSVGParser):** Parses SVG structure to identify plot elements, attaches hover interactivity

## Key Components

### Python Module (`/plotjs/`)

**`plotjs.py`** - Core `PlotJS` class with method chaining

- `__init__(fig, **savefig_kws)` - Converts matplotlib figure to SVG
- `add_tooltip(labels, groups, hover_nearest, ax)` - Configure hover tooltips
- `add_css(from_string)` - Add custom CSS styling
- `add_javascript(from_string)` - Add custom JavaScript
- `save(file_path)` / `as_html()` - Export to file or return HTML string
- Internal: `_set_plot_data_json()`, `_set_html()` - Prepare template data

**`css.py`** - CSS utilities

- `from_dict(css_dict)` - Convert Python dict to CSS
- `from_file(css_file)` - Load external CSS
- `is_css_like(s)` - Validate CSS syntax

**`javascript.py`** - JavaScript utilities

- `from_file(javascript_file)` - Load external JavaScript

**`utils.py`** - Internal helpers

- `_vector_to_list(vector, name)` - Convert pandas/numpy/lists using Narwhals
- `_get_and_sanitize_js(file_path, after_pattern)` - Extract JS code

**`data/datasets.py`** - Sample datasets (iris, mtcars, titanic) with Narwhals support

### Static Assets (`/plotjs/static/`)

**`template.html`** - Jinja2 template structure

- Injects: `{{ svg }}`, `{{ default_css }}`, `{{ additional_css }}`, `{{ js_parser }}`, `{{ plot_data_json }}`
- Creates tooltip container and event handling

**`plotparser.js`** - `PlotSVGParser` JavaScript class

- `findBars(svg, axes_class)` - Select bar chart elements
- `findPoints(svg, axes_class, tooltip_groups)` - Select scatter points
- `findLines(svg, axes_class)` - Select line chart elements
- `findAreas(svg, axes_class)` - Select filled area elements
- `nearestElementFromMouse(mouseX, mouseY, elements)` - Hover nearest detection
- `setHoverEffect(...)` - Attach mouseover handlers, show tooltips

**`default.css`** - Base styling for tooltips and hover states

## Technical Implementation Details

### SVG Parsing Strategy

Challenge: Identify plot elements in SVG without metadata.

Solution: Pattern-based CSS selectors targeting matplotlib's SVG structure:

| Element        | SVG Pattern                            | Selector                                                 |
| -------------- | -------------------------------------- | -------------------------------------------------------- |
| Scatter Points | `<g id="PathCollection_N"> <use>`      | `g#axes_class g[id^="PathCollection"] use`               |
| Lines          | `<g id="line2d_N"> <path>`             | `g#axes_class g[id^="line2d"] path` (exclude axis lines) |
| Bars           | `<g id="patch_N"> <path>`              | `g#axes_class g[id^="patch"] path[clip-path]`            |
| Areas          | `<g id="FillBetweenPolyCollection_N">` | `g#axes_class g[id^="FillBetweenPolyCollection"] path`   |

### Data Flow: Python → JavaScript

1. Python collects configuration:

```python
plot_data_json = {
    "tooltip_labels": [...],
    "tooltip_groups": [...],
    "tooltip_x_shift": 10,
    "tooltip_y_shift": -10,
    "hover_nearest": False,
    "axes": {"axes_1": {...}, "axes_2": {...}}
}
```

2. Jinja2 injects as JSON in HTML template

3. JavaScript accesses via `plot_data["axes"]["axes_1"]["tooltip_labels"]`

### Method Chaining

All methods return `self` for fluent API:

```python
PlotJS(fig).add_tooltip(...).add_css(...).save(...)
```

### Multiple Axes Support

Each axes processed independently via `ax` parameter:

```python
PlotJS(fig).add_tooltip(labels1, ax=ax1).add_tooltip(labels2, ax=ax2).save(...)
```

### Reproducibility

Optional `seed` parameter ensures deterministic UUID generation for consistent output.

## File Structure

```
plotjs/
├── __init__.py              # Package exports
├── plotjs.py                  # Core PlotJS class (330 lines)
├── css.py                   # CSS utilities (100 lines)
├── javascript.py            # JavaScript utilities (23 lines)
├── utils.py                 # Internal helpers (43 lines)
├── data/
│   ├── datasets.py          # Sample datasets with Narwhals
│   └── *.csv                # Data files
└── static/
    ├── template.html        # Jinja2 HTML template (104 lines)
    ├── plotparser.js        # SVG parser class (229 lines)
    └── default.css          # Default styles (41 lines)

tests/
├── test-python/             # Python unit tests
└── test-javascript/         # JavaScript unit tests (vitest + jsdom)

docs/                        # Comprehensive documentation
├── index.md                 # Quickstart
├── guides/                  # CSS, JavaScript, advanced usage
├── developers/              # Architecture, SVG parsing details
└── reference/               # API reference
```

## Dependencies

**Python:**

- matplotlib >= 3.10.0 (SVG export)
- jinja2 >= 3.0.0 (HTML templating)
- narwhals >= 2.0.0 (dataframe abstraction)

**Python Version:** Requires 3.10+

## Critical Patterns & Limitations

### Plotting Order Requirement

**IMPORTANT:** Element order in matplotlib must match label/group array order.

The parser assigns tooltip data by index, not by element identity:

```python
# PROBLEM: Mismatched order
for specie in df["species"].unique():  # Order: setosa, versicolor, virginica
    ax.scatter(df[df["species"]==specie]["x"], df[df["species"]==specie]["y"])
PlotJS(...).add_tooltip(labels=df["species"])  # Order may differ

# SOLUTION: Plot all at once or ensure sorted order
ax.scatter(df["x"], df["y"], c=df["species"])  # All at once preserves order
```

### Hover Modes

- **Direct hover** (default): Highlights exactly what cursor hovers over
- **Nearest hover** (`hover_nearest=True`): Highlights closest element to cursor (useful for small points)

### Grouping Behavior

Elements with same `tooltip_groups` value highlight together and dim others on hover.

## Usage Example

```python
import matplotlib.pyplot as plt
from plotjs import PlotJS

fig, ax = plt.subplots()
ax.scatter(x, y)

PlotJS(fig) \
    .add_tooltip(
        labels=["Point 1", "Point 2", ...],
        groups=["Group A", "Group A", "Group B", ...],
        hover_nearest=True
    ) \
    .add_css(css.from_file("custom.css")) \
    .add_javascript(javascript.from_file("custom.js")) \
    .save("output.html")
```

## Testing

- **Python:** pytest with coverage
- **JavaScript:** vitest with jsdom (browser simulation)

## Documentation

See `/docs` for comprehensive guides:

- Quickstart and examples
- CSS/JavaScript customization
- SVG parsing deep dive
- Troubleshooting common issues
- API reference for all classes

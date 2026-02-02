import pytest
import matplotlib.pyplot as plt
from plotjs import PlotJS, data

pytestmark = pytest.mark.browser


def test_scatter_plot_renders(page, tmp_output_dir, load_html):
    """Test that a basic scatter plot renders without errors."""
    # Create a simple scatter plot
    fig, ax = plt.subplots()
    ax.scatter([1, 2, 3], [1, 2, 3])

    # Generate HTML
    html_path = tmp_output_dir / "scatter.html"
    PlotJS(fig).save(str(html_path))
    plt.close(fig)

    # Load in browser
    load_html(page, html_path)

    # Check SVG exists
    svg = page.locator("svg")
    assert svg.count() == 1

    # Check no console errors
    messages = []
    page.on("console", lambda msg: messages.append(msg))
    page.reload()
    page.wait_for_selector("svg")

    errors = [msg for msg in messages if msg.type == "error"]
    assert len(errors) == 0, f"Console errors: {errors}"


def test_line_plot_renders(page, tmp_output_dir, load_html):
    """Test that a line plot renders correctly."""
    fig, ax = plt.subplots()
    ax.plot([1, 2, 3, 4], [1, 4, 2, 3])

    html_path = tmp_output_dir / "line.html"
    PlotJS(fig).save(str(html_path))
    plt.close(fig)

    load_html(page, html_path)

    # Check that line elements exist
    svg = page.locator("svg")
    assert svg.count() == 1

    # Check for line paths in SVG
    lines = page.locator('svg g[id^="line2d"] path')
    assert lines.count() > 0


def test_bar_plot_renders(page, tmp_output_dir, load_html):
    """Test that a bar plot renders correctly."""
    fig, ax = plt.subplots()
    ax.bar([1, 2, 3], [1, 2, 3])

    html_path = tmp_output_dir / "bar.html"
    PlotJS(fig).save(str(html_path))
    plt.close(fig)

    load_html(page, html_path)

    # Check that bar elements exist
    svg = page.locator("svg")
    assert svg.count() == 1

    # Check for bar patches
    bars = page.locator('svg g[id^="patch"] path')
    assert bars.count() >= 3  # At least the 3 bars


def test_multiple_axes_render(page, tmp_output_dir, load_html):
    """Test that plots with multiple axes render correctly."""
    df = data.load_iris().head(10)

    fig, axs = plt.subplots(ncols=2, figsize=(10, 4))
    axs[0].scatter(df["sepal_width"], df["sepal_length"])
    axs[1].scatter(df["petal_width"], df["petal_length"])

    html_path = tmp_output_dir / "multi_axes.html"
    PlotJS(fig).save(str(html_path))
    plt.close(fig)

    load_html(page, html_path)

    # Check SVG exists
    svg = page.locator("svg")
    assert svg.count() == 1

    # Check that both axes groups exist
    axes_groups = page.locator('svg g[id^="axes_"]')
    assert axes_groups.count() == 2


def test_custom_css_applies(page, tmp_output_dir, load_html):
    """Test that custom CSS is applied correctly."""
    fig, ax = plt.subplots()
    ax.scatter([1, 2, 3], [1, 2, 3])

    custom_css = ".tooltip { background-color: rgb(255, 0, 0); }"

    html_path = tmp_output_dir / "custom_css.html"
    PlotJS(fig).add_css(custom_css).save(str(html_path))
    plt.close(fig)

    load_html(page, html_path)

    # Check that custom CSS is in the document
    style_content = page.locator("style").all_inner_texts()
    assert any("rgb(255, 0, 0)" in content for content in style_content)


def test_large_dataset_renders(page, tmp_output_dir, load_html):
    """Test that plots with large datasets render without issues."""
    import numpy as np

    # Create a larger dataset
    n = 1000
    x = np.random.randn(n)
    y = np.random.randn(n)

    fig, ax = plt.subplots()
    ax.scatter(x, y, alpha=0.5)

    html_path = tmp_output_dir / "large_dataset.html"
    PlotJS(fig).save(str(html_path))
    plt.close(fig)

    load_html(page, html_path)

    # Check SVG rendered
    svg = page.locator("svg")
    assert svg.count() == 1

    # Check that many points exist
    points = page.locator('svg g[id^="PathCollection"] use')
    assert points.count() == n


def test_no_javascript_errors_on_load(page, tmp_output_dir, load_html):
    """Test that no JavaScript errors occur during page load."""
    df = data.load_iris().head(20)

    fig, ax = plt.subplots()
    ax.scatter(df["sepal_width"], df["sepal_length"])

    html_path = tmp_output_dir / "error_check.html"
    PlotJS(fig).add_tooltip(labels=df["species"]).save(str(html_path))
    plt.close(fig)

    # Collect console messages
    console_messages = []
    page.on("console", lambda msg: console_messages.append(msg))

    load_html(page, html_path)

    # Check for errors
    errors = [msg for msg in console_messages if msg.type == "error"]
    assert len(errors) == 0, f"JavaScript errors found: {[msg.text for msg in errors]}"

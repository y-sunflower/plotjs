# Browser Tests

Headless browser tests using Playwright to test actual rendering and interactions.

## Setup

Install Playwright and browser binaries using uv:

```bash
# Install Python dependencies
uv pip install playwright pytest

# Install Chromium browser
uv run playwright install chromium
```

## Running Tests

Run all browser tests:

```bash
uv run pytest tests/test-browser/
```

Run specific test file:

```bash
uv run pytest tests/test-browser/test_rendering.py
uv run pytest tests/test-browser/test_interactions.py
```

Run with verbose output:

```bash
uv run pytest tests/test-browser/ -v
```

Run only browser-marked tests:

```bash
uv run pytest -m browser
```

Skip browser tests (useful for quick feedback):

```bash
uv run pytest -m "not browser"
```

Run in headed mode (see the browser):

```bash
# Modify conftest.py temporarily to set headless=False in the browser fixture
```

## Test Structure

- `conftest.py` - Pytest fixtures for browser setup and helpers
- `test_rendering.py` - Tests for SVG rendering, CSS application, and no-error loading
- `test_interactions.py` - Tests for tooltips, hover effects, grouping, and interactive features

## What These Tests Cover

### Rendering Tests
- Basic plot types (scatter, line, bar)
- Multiple axes
- Custom CSS application
- Large datasets
- JavaScript error detection

### Interaction Tests
- Tooltip appearance and content
- Hover effects and CSS classes
- Element grouping and highlighting
- Dimming non-hovered elements
- Hover nearest mode
- Multi-axes independent interactions

## Debugging

To see the browser while tests run, modify `conftest.py`:

```python
browser = p.chromium.launch(headless=False, slow_mo=500)
```

To pause execution and inspect:

```python
page.pause()  # Opens Playwright Inspector
```

To capture screenshots on failure:

```python
pytest tests/test-browser/ --screenshot=only-on-failure
```

## CI Integration

Browser tests run automatically in GitHub Actions via the `tests-browser.yaml` workflow.

The workflow:
- Runs on Ubuntu with Python 3.10 and 3.13
- Installs Playwright and Chromium browser
- Executes all browser tests
- Uploads test artifacts on failure

For other CI environments, ensure Playwright browsers are installed:

```bash
# In CI setup
uv run playwright install --with-deps chromium
```

## Performance Considerations

- Browser tests are slower than unit tests (2-5s per test)
- Run browser tests separately from unit tests in CI
- Use `pytest -m "not browser"` to skip browser tests if needed

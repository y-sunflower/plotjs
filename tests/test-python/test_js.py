from plotjs import javascript, PlotJS
from plotjs.utils import _get_and_sanitize_js
import pytest


def test_javascript_from_file():
    js_content = javascript.from_file("tests/test-python/static/script.js")
    with open("tests/test-python/static/script.js") as f:
        js_content_expected = f.read()
    assert js_content == js_content_expected


def test_get_and_sanitize_js():
    js_content = _get_and_sanitize_js(
        "tests/test-python/static/script2.js",
        after_pattern=r"const.*",
    )
    assert js_content == 'const aVariable = "hello";\n'


def test_get_and_sanitize_js_error():
    after_pattern = r"hey.*"
    with pytest.raises(
        ValueError, match=f"Could not find '{after_pattern}' in the file"
    ):
        _get_and_sanitize_js(
            "tests/test-python/static/script2.js", after_pattern=after_pattern
        )


def test_js_from_different_inputs():
    plotjs = PlotJS()

    plotjs.add_javascript('const aVariable = "hello";')
    assert plotjs.additional_javascript == 'const aVariable = "hello";'

    plotjs.add_javascript('const bVariable = "hello";')
    assert (
        plotjs.additional_javascript
        == 'const aVariable = "hello";const bVariable = "hello";'
    )

    plotjs = PlotJS()
    plotjs.add_javascript(from_file="tests/test-python/static/script.js")
    assert (
        plotjs.additional_javascript
        == """document.querySelectorAll(".point").forEach((el) => {
  el.addEventListener("click", function () {
    const group = this.getAttribute("data-group");

    // Toggle logic
    const active = this.classList.contains("clicked");
    document.querySelectorAll(".point").forEach((p) => {
      p.classList.remove("clicked");
      p.classList.remove("dimmed");
    });

    if (!active) {
      this.classList.add("clicked");
      document.querySelectorAll(".point").forEach((p) => {
        if (p.getAttribute("data-group") !== group) {
          p.classList.add("dimmed");
        }
      });
    }
  });
});
"""
    )

    plotjs.add_javascript('const bVariable = "hello";')
    assert (
        plotjs.additional_javascript
        == """document.querySelectorAll(".point").forEach((el) => {
  el.addEventListener("click", function () {
    const group = this.getAttribute("data-group");

    // Toggle logic
    const active = this.classList.contains("clicked");
    document.querySelectorAll(".point").forEach((p) => {
      p.classList.remove("clicked");
      p.classList.remove("dimmed");
    });

    if (!active) {
      this.classList.add("clicked");
      document.querySelectorAll(".point").forEach((p) => {
        if (p.getAttribute("data-group") !== group) {
          p.classList.add("dimmed");
        }
      });
    }
  });
});
const bVariable = "hello";"""
    )

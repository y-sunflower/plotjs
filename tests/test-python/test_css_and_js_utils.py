from plotjs import css, javascript
from plotjs.utils import _get_and_sanitize_js
import pytest


@pytest.mark.parametrize(
    "input, output",
    [
        (
            {
                ".tooltip": {"color": "red", "background": "blue"},
            },
            ".tooltip{color:red;background:blue;}",
        ),
        (
            {
                ".tooltip": {"color": "red", "background": "blue !important"},
                ".point": {"width": "10px", "height": "200px"},
            },
            ".tooltip{color:red;background:blue !important;}.point{width:10px;height:200px;}",
        ),
        (
            {
                ".button": {
                    "font-family": "'Helvetica Neue', sans-serif",
                    "font-size": "14px",
                    "margin": "0 auto",
                },
                "#main .container": {
                    "padding": "10px",
                    "border": "1px solid black",
                },
                ".empty": {},
            },
            ".button{font-family:'Helvetica Neue', sans-serif;font-size:14px;margin:0 auto;}#main .container{padding:10px;border:1px solid black;}.empty{}",
        ),
    ],
)
def test_css_from_dict(input, output):
    assert css.from_dict(input) == output
    assert css.is_css_like(css.from_dict(input))


def test_css_warnings():
    with pytest.warns(UserWarning, match=r"CSS may be invalid: "):
        css.from_dict({".tooltip": {"color": "", "background": "blue"}})

    with pytest.warns(UserWarning, match=r"CSS may be invalid: "):
        css.from_file("tests/test-python/static/style-invalid.css")


def test_css_from_file():
    css_content = css.from_file("tests/test-python/static/style.css")
    css_expected = """svg {
  width: 100%;
  height: auto;
}

.point {
  opacity: 1;
  transition: opacity 0.1s ease;
}
"""
    assert css_content == css_expected


@pytest.mark.parametrize(
    "input, output",
    [
        (
            ".tooltip{color:red;background:blue !important;}.point{width:10px;height:200px;}",
            True,
        ),
        (".tooltip{color:red;background:blue;}", True),
        ("Not css", False),
        ("Still Not css", False),
        (".box{broken}", False),
    ],
)
def test_is_css_like(input, output):
    assert css.is_css_like(input) == output


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

from plotjs import css, javascript
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


def test_css_from_file():
    css_content = css.from_file("tests/static/style.css")
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
    js_content = javascript.from_file("tests/static/script.js")
    with open("tests/static/script.js") as f:
        js_content_expected = f.read()
    assert js_content == js_content_expected

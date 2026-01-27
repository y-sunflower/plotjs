from plotjs import css, PlotJS
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
    from_string = css.from_file("tests/test-python/static/style.css")
    css_expected = """svg {
  width: 100%;
  height: auto;
}

.point {
  opacity: 1;
  transition: opacity 0.1s ease;
}
"""
    assert from_string == css_expected


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


def test_plotjs_css_from_different_inputs():
    plotjs = PlotJS()

    plotjs.add_css(".tooltip{color:red;background:blue;}")
    assert plotjs.additional_css == ".tooltip{color:red;background:blue;}"

    plotjs.add_css(".tooltip{color:red;background:blue;}")
    assert (
        plotjs.additional_css
        == ".tooltip{color:red;background:blue;}.tooltip{color:red;background:blue;}"
    )

    plotjs = PlotJS()
    plotjs.add_css(from_dict={".tooltip": {"color": "red", "background": "blue"}})
    assert plotjs.additional_css == ".tooltip{color:red;background:blue;}"

    plotjs.add_css(".tooltip{color:red;background:blue;}")
    assert (
        plotjs.additional_css
        == ".tooltip{color:red;background:blue;}.tooltip{color:red;background:blue;}"
    )

    plotjs = PlotJS()
    plotjs.add_css(from_file="tests/test-python/static/style.css")
    assert (
        plotjs.additional_css
        == """svg {
  width: 100%;
  height: auto;
}

.point {
  opacity: 1;
  transition: opacity 0.1s ease;
}
"""
    )

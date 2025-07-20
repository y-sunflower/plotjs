import re


def from_dict(css_dict: dict) -> str:
    """
    Get raw CSS in a string from a dictionnary. It's a
    utility function useful to write CSS from a Python
    dictionnary.

    Args:
        css_dict: A dictionnary with keys (selectors) and value
            (dictionnary of property-value).

    Returns:
        A string of raw CSS.

    Usage:
        ```python
        from plotjs import css

        css.from_dict({
            ".tooltip": {"color": "red", "background": "blue !important"},
            ".point": {"width": "10px", "height": "200px"},
        })
        ```
    """
    css: str = ""

    for selector, css_props in css_dict.items():
        css += f"{selector}{{"
        for prop, value in css_props.items():
            css += f"{prop}:{value};"
        css += "}"

    return css


def from_file(css_file: str) -> str:
    """
    Get raw CSS from a CSS file. This function just
    reads the CSS from a given file.

    Args:
        css_file: Path to a CSS file.

    Returns:
        A string of raw CSS

    Usage:
        ```python
        from plotjs import css

        css.from_file("path/to/style.css")
        ```
    """
    with open(css_file, "r") as f:
        css: str = f.read()
    return css


def is_css_like(s: str) -> bool:
    """
    Check whether a string looks like valid CSS.

    Args:
        s: A string to evaluate.

    Returns:
        Whether or not `s` looks like valid CSS.

    Usage:
        ```python
        from plotjs import is_css_like

        is_css_like("This is not CSS.") # False
        is_css_like(".box { broken }") # False
        is_css_like(".tooltip { color: red; background: blue; }") # True
        ```
    """
    css_block_pattern = re.compile(
        r"""
        [^{]+\s*              # Selector (at least one char that's not '{')
        \{\s*                 # Opening brace
        ([^:{}]+:\s*[^;{}]+;\s*)+  # At least one prop: value; pair
        \}                    # Closing brace
        """,
        re.VERBOSE,
    )

    matches = css_block_pattern.findall(s)
    return bool(matches)


print(from_dict({".tooltip": {"color": "red", "background": "blue"}}))

from_file("sandbox/style.css")

print(
    is_css_like(
        from_dict(
            {
                ".tooltip": {"color": "red", "background": "blue"},
                ".point": {"width": "10px", "max-width": "100px"},
            }
        )
    )
)

print(is_css_like("This is not CSS."))  # False

print(is_css_like(".box { broken }"))  # False

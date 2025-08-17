def from_file(javascript_file: str) -> str:
    """
    Get raw javascript from a javascript file.
    This function just reads the js from a given
    file.

    Args:
        javascript_file: Path to a js file.

    Returns:
        A string of raw javascript.

    Examples:
        ```python
        from plotjs import javascript

        javascript.from_file("path/to/script.js")
        ```
    """
    with open(javascript_file, "r") as f:
        js: str = f.read()

    return js

def dict_to_css(css_dict: dict, selector: str) -> str:
    css: str = f"{selector}{{"
    for key, val in css_dict.items():
        css += f"{key}:{val};"

    return css + "};"


dict_to_css({"width": "60%", "height": "auto"}, selector=".tooltip")

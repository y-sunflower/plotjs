.PHONY: all examples coverage

all: examples coverage

examples:
	quarto render docs/index.qmd
	uv run docs/guides/advanced/advanced.py
	uv run docs/guides/css/css.py
	uv run docs/guides/javascript/javascript.py

coverage:
	uv run coverage run --source=plotjs -m pytest
	uv run coverage report -m
	uv run coverage xml
	uv run genbadge coverage -i coverage.xml
	rm coverage.xml

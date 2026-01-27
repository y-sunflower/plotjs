examples:
	quarto render docs/index.qmd
	uv run docs/guides/advanced/advanced.py
	uv run docs/guides/css/css.py
	uv run docs/guides/javascript/javascript.py

gallery:
	quarto render docs/gallery/index.qmd

coverage:
	uv run coverage run --source=plotjs -m pytest
	uv run coverage report -m
	uv run coverage xml
	uv run genbadge coverage -i coverage.xml
	rm coverage.xml

preview:
	uv run mkdocs serve

jsdoc:
	bun run docs:js

test:
	uv run pytest
	bun test

test-python:
	uv run pytest

test-js:
	bun test

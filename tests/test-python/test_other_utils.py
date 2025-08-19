import pytest
import re
from plotjs.utils import _vector_to_list
import pandas as pd
import polars as pl
import numpy as np


@pytest.mark.parametrize(
    "input, output_expected",
    [
        (
            pd.Series([1, 2, 3, 4.5]),
            [1, 2, 3, 4.5],
        ),
        (
            pl.Series([1, 2, 3, 4]),
            [1, 2, 3, 4],
        ),
        (
            [1, 2, 3, 4.5],
            [1, 2, 3, 4.5],
        ),
        (
            (1, 2, 3, 4.5),
            [1, 2, 3, 4.5],
        ),
        (
            np.array([1, 2, 3, 4.5]),
            [1, 2, 3, 4.5],
        ),
    ],
)
def test_vector_to_list(input, output_expected):
    assert _vector_to_list(input) == output_expected


@pytest.mark.parametrize("wrong_vector", ["", 1, 3.4])
def test_vector_to_list_error(wrong_vector):
    with pytest.raises(
        ValueError,
        match=re.escape(
            "labels and groups must be a Series or a valid iterable (list, tuple, ndarray...)."
        ),
    ):
        _vector_to_list(wrong_vector)

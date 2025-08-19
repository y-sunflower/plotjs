import pytest
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

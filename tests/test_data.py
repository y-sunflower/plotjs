import pytest
import pandas as pd
import polars as pl

from plotjs.data import load_iris, load_mtcars, load_titanic, _load_data


def test_invalid_dataset_name():
    with pytest.raises(ValueError, match=r"^dataset_name must be one of:"):
        _load_data("invalid_dataset", backend="pandas")


@pytest.mark.parametrize("dataset", ["iris", "mtcars", "titanic"])
def test_load_data_pandas(dataset):
    df = _load_data(dataset, backend="pandas")
    assert isinstance(df, pd.DataFrame)
    assert not df.empty


@pytest.mark.parametrize("dataset", ["iris", "mtcars", "titanic"])
def test_load_data_polars(dataset):
    df = _load_data(dataset, backend="polars")
    assert isinstance(df, pl.DataFrame)
    assert not df.is_empty()


def test_load_iris():
    df = load_iris()
    assert len(df) == 150
    assert not df.empty
    assert isinstance(df, pd.DataFrame)
    assert df.columns.to_list() == [
        "sepal_length",
        "sepal_width",
        "petal_length",
        "petal_width",
        "species",
    ]


def test_load_mtcars():
    df = load_mtcars()
    assert len(df) == 32
    assert not df.empty
    assert isinstance(df, pd.DataFrame)
    assert df.columns.to_list() == [
        "model",
        "mpg",
        "cyl",
        "disp",
        "hp",
        "drat",
        "wt",
        "qsec",
        "vs",
        "am",
        "gear",
        "carb",
    ]


def test_load_titanic():
    df = load_titanic()
    assert len(df) == 891
    assert not df.empty
    assert isinstance(df, pd.DataFrame)
    assert df.columns.to_list() == [
        "PassengerId",
        "Survived",
        "Pclass",
        "Name",
        "Sex",
        "Age",
        "SibSp",
        "Parch",
        "Ticket",
        "Fare",
        "Cabin",
        "Embarked",
    ]

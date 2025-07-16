import narwhals as nw
import os

from typing import List
from narwhals.typing import Frame

PACKAGE_DIR: str = os.path.dirname(os.path.abspath(__file__))
AVAILABLE_DATASETS: List[str] = ["iris", "mtcars", "titanic"]


def _load_data(dataset_name: str, backend: str) -> Frame:
    """
    Load one of the available datasets in fleur.

    Args:
        dataset_name: A string specifying the name of the dataset. Currently,
            "iris", "mtcars" and "titanic" are supported.
        backend: The output format of the dataframe.
    Returns:
        A dataframe with the specified dataset.
    """
    dataset_name: str = dataset_name.lower()

    if dataset_name not in AVAILABLE_DATASETS:
        raise ValueError(
            f"dataset_name must be one of: {' ,'.join(AVAILABLE_DATASETS)}"
        )

    dataset_file: str = f"{dataset_name}.csv"
    dataset_path: str = os.path.join(PACKAGE_DIR, dataset_file)
    df: Frame = nw.read_csv(dataset_path, backend=backend)

    return df.to_native()


def load_iris(output_format: str = "pandas") -> Frame:
    """
    Load the iris dataset.

    Args:
        output_format: The output format of the dataframe. Note that, for example,
            if you set `output_format="polars"`, you must have polars installed.
            Must be one of the following: "pandas", "polars", "pyarrow", "modin",
            "cudf". Default to "pandas".

    Returns:
        The iris dataset.
    """
    return _load_data("iris", backend=output_format)


def load_mtcars(output_format: str = "pandas") -> Frame:
    """
    Load the mtcars dataset.

    Args:
        output_format: The output format of the dataframe. Note that, for example,
            if you set `output_format="polars"`, you must have polars installed.
            Must be one of the following: "pandas", "polars", "pyarrow", "modin",
            "cudf". Default to "pandas".

    Returns:
        The mtcars dataset.
    """
    return _load_data("mtcars", backend=output_format)


def load_titanic(output_format: str = "pandas") -> Frame:
    """
    Load the titanic dataset.

    Args:
        output_format: The output format of the dataframe. Note that, for example,
            if you set `output_format="polars"`, you must have polars installed.
            Must be one of the following: "pandas", "polars", "pyarrow", "modin",
            "cudf". Default to "pandas".

    Returns:
        The titanic dataset.
    """
    return _load_data("titanic", backend=output_format)

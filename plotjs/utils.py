import narwhals as nw
from narwhals.dependencies import is_numpy_array, is_into_series


def _vector_to_list(vector, name="labels and groups") -> list:
    if isinstance(vector, (list, tuple)) or is_numpy_array(vector):
        return list(vector)
    elif is_into_series(vector):
        return nw.from_native(vector, allow_series=True).to_list()
    else:
        raise ValueError(
            f"{name} must be a Series or a valid iterable (list, tuple, ndarray...)."
        )

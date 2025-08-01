from plotjs import MagicPlot

import matplotlib.pyplot as plt

import pytest


def test_magic_plot_messages():
    fig = plt.figure()
    with pytest.raises(
        ValueError, match="No Axes found in Figure. Make sure your graph is not empty."
    ):
        MagicPlot(fig=fig)

    fig, axs = plt.subplots(ncols=2)
    with pytest.warns(
        UserWarning, match="Figure with multiple Axes is not supported yet."
    ):
        MagicPlot(fig=fig)

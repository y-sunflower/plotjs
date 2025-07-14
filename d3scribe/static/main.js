const tooltip = d3.select("#tooltip");
const svg = d3.select("svg");
const points = svg.selectAll("#PathCollection_1 use");

d3.json("plot_data.json").then(function (plot_data) {
  const scatter_data = plot_data["scatter_data"];
  const x_label = plot_data["x_label"];
  const y_label = plot_data["y_label"];
  const tooltip_label = plot_data["tooltip"];

  points.data(scatter_data).attr("class", "scatter-point");

  points
    .on("mouseover", function (event, d) {
      const nodes = points.nodes();
      const i = nodes.indexOf(this);
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px")
        .html(tooltip_label[i]);
    })
    .on("mouseout", () => tooltip.style("display", "none"));
});

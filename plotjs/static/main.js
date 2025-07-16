const tooltip = d3.select("#tooltip");
const svg = d3.select("svg");
const points = svg.selectAll("#PathCollection_1 use");
points.attr("class", "scatter-point");

const plot_data = JSON.parse(`{{ plot_data_json | tojson | safe }}`);
const tooltip_label = plot_data["tooltip"];
const tooltip_group = plot_data["tooltip_group"];

const isGrouped =
  Array.from(new Set(tooltip_group)).length < tooltip_group.length;

points
  .on("mouseover", function (event, d) {
    const nodes = points.nodes();
    const i = nodes.indexOf(this);
    const hovered_group = tooltip_group[i];

    points
      .transition()
      .duration(100)
      .style("opacity", function (_, j) {
        if (isGrouped) {
          return tooltip_group[j] === hovered_group ? 1 : 0.2;
        } else {
          return j === i ? 1 : 0.2;
        }
      });

    tooltip
      .style("display", "block")
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px")
      .html(tooltip_label[i]);
  })
  .on("mouseout", function () {
    points.transition().duration(100).style("opacity", 1);
    tooltip.style("display", "none");
  });

const tooltip = d3.select("#tooltip");
const svg = d3.select("svg");
const points = svg.selectAll("#PathCollection_1 use");

points.attr("class", "scatter-point");

points
  .on("mouseover", function (event, d) {
    tooltip
      .style("display", "block")
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px")
      .text("Hovered a circle!");
  })
  .on("mouseout", () => tooltip.style("display", "none"));

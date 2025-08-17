import * as d3 from "d3-selection";

export default class PlotSVGParser {
  constructor(svg, tooltip, tooltip_x_shift, tooltip_y_shift) {
    this.svg = svg;
    this.tooltip = tooltip;
    this.tooltip_x_shift = tooltip_x_shift;
    this.tooltip_y_shift = tooltip_y_shift;
  }

  find_bars(svg, axes_class) {
    // select all #patch within the specific axes
    const bars = svg
      .selectAll(`g#${axes_class} g[id^="patch"]`)
      .filter(function () {
        const path = d3.select(this).select("path");
        // that have a clip-path attribute
        const clip = path.attr("clip-path");
        // starting with "url("
        return clip && clip.startsWith("url(");
      });

    bars.attr("class", "bar plot-element");
    return bars;
  }

  find_points(svg, axes_class, tooltip_groups) {
    const self = this;
    // select all <use> in #PathCollection within the specific axes
    const points = svg.selectAll(`g#${axes_class} g[id^="PathCollection"] use`);

    points.each(function (_, i) {
      d3.select(this).attr("data-group", tooltip_groups[i]);
    });
    points.attr("class", "point plot-element");
    return points;
  }

  find_lines(svg, axes_class) {
    // select all <path> of Line2D elements within the specific axes
    const lines = svg
      .selectAll(`g#${axes_class} g[id^="line2d"] path`)
      .filter(function () {
        return !this.closest('g[id^="matplotlib.axis"]');
      });

    lines.attr("class", "line plot-element");
    return lines;
  }

  find_areas(svg, axes_class) {
    // select all <path> of FillBetweenPolyCollection elements within the specific axes
    const areas = svg.selectAll(
      `g#${axes_class} g[id^="FillBetweenPolyCollection"] path`
    );
    areas.attr("class", "area plot-element");
    return areas;
  }

  nearest_element_from_mouse(mouseX, mouseY, elements) {
    let nearestElem = null;
    let minDist = Infinity;

    elements.each(function (_, i) {
      const bbox = this.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      const dist = Math.hypot(mouseX - cx, mouseY - cy);
      if (dist < minDist) {
        minDist = dist;
        nearestElem = this;
      }
    });

    return nearestElem;
  }

  setHoverEffect(
    plot_element,
    axes_class,
    tooltip_labels,
    tooltip_groups,
    show_tooltip,
    hover_nearest
  ) {
    const self = this;
    const axesGroup = this.svg.select(`g#${axes_class}`);
    const getHoveredIndex = hover_nearest
      ? (event) => {
          const [mouseX, mouseY] = d3.pointer(event);
          const allElements = axesGroup.selectAll(".plot-element");
          const nearestElem = self.nearest_element_from_mouse(
            mouseX,
            mouseY,
            allElements
          );
          return nearestElem ? allElements.nodes().indexOf(nearestElem) : null;
        }
      : (event) => plot_element.nodes().indexOf(event.currentTarget);

    const mousemoveHandler = (event) => {
      const hoveredIndex = getHoveredIndex(event);
      const allElements = axesGroup.selectAll(".plot-element");

      allElements.classed("hovered", false).classed("not-hovered", false);

      if (hoveredIndex !== null) {
        const hoveredGroup = tooltip_groups[hoveredIndex];

        allElements
          .filter((_, j) => tooltip_groups[j] === hoveredGroup)
          .classed("hovered", true);

        allElements
          .filter((_, j) => tooltip_groups[j] !== hoveredGroup)
          .classed("not-hovered", true);

        self.tooltip
          .style("display", show_tooltip)
          .style("left", event.pageX + self.tooltip_x_shift + "px")
          .style("top", event.pageY + self.tooltip_y_shift + "px")
          .html(tooltip_labels[hoveredIndex]);
      } else {
        self.tooltip.style("display", "none");
      }
    };

    if (hover_nearest) {
      axesGroup.on("mousemove", mousemoveHandler).on("mouseout", () => {
        axesGroup
          .selectAll(".plot-element")
          .classed("hovered", false)
          .classed("not-hovered", false);
        self.tooltip.style("display", "none");
      });
    } else {
      plot_element.on("mouseover", mousemoveHandler).on("mouseout", () => {
        plot_element.classed("hovered", false).classed("not-hovered", false);
        self.tooltip.style("display", "none");
      });
    }
  }
}

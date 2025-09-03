import * as d3 from "d3-selection";

/**
 * Core utility for parsing and interacting with matplotlib-generated SVG outputs.
 * Provides methods to query common plot elements (bars, points, lines, areas),
 * and to attach interactive hover tooltips.
 *
 * Example usage:
 * ```js
 * const parser = new PlotSVGParser(svg, tooltip, xShift, yShift);
 * const points = parser.findPoints(svg, "axes_1", tooltipGroups);
 * parser.setHoverEffect(points, "axes_1", tooltipLabels, tooltipGroups, "block", true);
 * ```
 */
export default class PlotSVGParser {
  /**
   * Create a new parser bound to an SVG figure.
   *
   * @param {d3.Selection} svg - D3 selection of the target SVG element (e.g. the entire plot).
   * @param {d3.Selection} tooltip - D3 selection of the tooltip container (e.g. a div).
   * @param {number} tooltip_x_shift - Horizontal offset for tooltip positioning.
   * @param {number} tooltip_y_shift - Vertical offset for tooltip positioning.
   */
  constructor(svg, tooltip, tooltip_x_shift, tooltip_y_shift) {
    this.svg = svg;
    this.tooltip = tooltip;
    this.tooltip_x_shift = tooltip_x_shift;
    this.tooltip_y_shift = tooltip_y_shift;
  }

  /**
   * Find bar elements (`patch` groups with clipping) inside a given axes.
   *
   * @param {d3.Selection} svg - D3 selection of the SVG element.
   * @param {string} axes_class - ID of the axes group (e.g. "axes_1").
   * @returns {d3.Selection} D3 selection of bar elements.
   */
  findBars(svg, axes_class) {
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

    console.log(`Found ${bars.size()} "bar" element`);
    return bars;
  }

  /**
   * Find scatter plot points inside a given axes.
   * Handles both `<use>` and `<path>` fallback cases,
   * and assigns `data-group` attributes based on tooltip groups.
   *
   * @param {d3.Selection} svg - D3 selection of the SVG element.
   * @param {string} axes_class - ID of the axes group (e.g. "axes_1").
   * @param {string[]} tooltip_groups - Group identifiers for tooltips, parallel to points.
   * @returns {d3.Selection} D3 selection of point elements.
   */
  findPoints(svg, axes_class, tooltip_groups) {
    let points = svg.selectAll(
      `g#${axes_class} g[id^="PathCollection"] g[clip-path] use`
    );

    if (points.empty()) {
      // fallback: no <use> found → grab <path> instead
      points = svg.selectAll(`g#${axes_class} g[id^="PathCollection"] path`);
    }

    points.each(function (_, i) {
      d3.select(this).attr("data-group", tooltip_groups[i]);
    });
    points.attr("class", "point plot-element");

    console.log(`Found ${points.size()} "point" element`);
    return points;
  }

  /**
   * Find line elements (`line2d` paths) inside a given axes,
   * excluding axis grid lines.
   *
   * @param {d3.Selection} svg - D3 selection of the SVG element.
   * @param {string} axes_class - ID of the axes group.
   * @returns {d3.Selection} D3 selection of line elements.
   */
  findLines(svg, axes_class) {
    // select all <path> of Line2D elements within the specific axes
    const lines = svg
      .selectAll(`g#${axes_class} g[id^="line2d"] path`)
      .filter(function () {
        return !this.closest('g[id^="matplotlib.axis"]');
      });

    lines.attr("class", "line plot-element");

    console.log(`Found ${lines.size()} "line" element`);
    return lines;
  }

  /**
   * Find filled area elements (`FillBetweenPolyCollection` paths) inside a given axes.
   *
   * @param {d3.Selection} svg - D3 selection of the SVG element.
   * @param {string} axes_class - ID of the axes group.
   * @returns {d3.Selection} D3 selection of area elements.
   */
  findAreas(svg, axes_class) {
    // select all <path> of FillBetweenPolyCollection elements within the specific axes
    const areas = svg.selectAll(
      `g#${axes_class} g[id^="FillBetweenPolyCollection"] path`
    );
    areas.attr("class", "area plot-element");

    console.log(`Found ${areas.size()} "area" element`);
    return areas;
  }

  /**
   * Compute the nearest element to the mouse cursor from a set of elements.
   * Uses bounding box centers for distance.
   * This function is used when the `hover_nearest` argument is true.
   *
   * @param {number} mouseX - X coordinate of the mouse relative to SVG.
   * @param {number} mouseY - Y coordinate of the mouse relative to SVG.
   * @param {d3.Selection} elements - Selection of candidate elements.
   * @returns {Element|null} The nearest DOM element or `null`.
   */
  nearestElementFromMouse(mouseX, mouseY, elements) {
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

  /**
   * Attach hover interaction and tooltip display to plot elements.
   * Can highlight nearest element (if enabled) or hovered element directly.
   *
   * @param {d3.Selection} plot_element - Selection of plot elements (points, lines, etc.).
   * @param {string} axes_class - ID of the axes group.
   * @param {string[]} tooltip_labels - Tooltip labels for each element.
   * @param {string[]} tooltip_groups - Group identifiers for each element.
   * @param {"block"|"none"} show_tooltip - Whether to display tooltips.
   * @param {boolean} hover_nearest - If true, highlight nearest element instead of hovered one.
   */
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
          const nearestElem = self.nearestElementFromMouse(
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

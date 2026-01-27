/**
 * Lightweight Selection wrapper that mimics d3-selection's chainable API.
 * Provides basic DOM manipulation methods for working with SVG elements.
 */
class Selection {
  constructor(elements) {
    this.elements = Array.isArray(elements) ? elements : [elements];
  }

  select(selector) {
    const first = this.elements[0];
    return first
      ? new Selection(first.querySelector(selector))
      : new Selection([]);
  }

  selectAll(selector) {
    const matched = [];
    this.elements.forEach((el) => {
      if (el && el.querySelectorAll) {
        matched.push(...el.querySelectorAll(selector));
      }
    });
    return new Selection(matched);
  }

  attr(name, value) {
    if (arguments.length === 1) {
      return this.elements[0]?.getAttribute(name);
    }
    this.elements.forEach((el) => el?.setAttribute(name, value));
    return this;
  }

  classed(name, add) {
    if (arguments.length === 1) {
      return this.elements[0]?.classList.contains(name);
    }
    this.elements.forEach((el) => {
      if (add) el?.classList.add(name);
      else el?.classList.remove(name);
    });
    return this;
  }

  style(name, value) {
    if (arguments.length === 0) {
      return this.elements[0]?.style[name];
    }
    this.elements.forEach((el) => {
      if (el) el.style[name] = value;
    });
    return this;
  }

  html(content) {
    if (arguments.length === 0) {
      return this.elements[0]?.innerHTML;
    }
    this.elements.forEach((el) => {
      if (el) el.innerHTML = content;
    });
    return this;
  }

  on(event, handler) {
    this.elements.forEach((el) => {
      if (el) el.addEventListener(event, handler);
    });
    return this;
  }

  filter(predicate) {
    const filtered = this.elements.filter((el, i) =>
      predicate.call(el, null, i),
    );
    return new Selection(filtered);
  }

  each(callback) {
    this.elements.forEach((el, i) => {
      callback.call(el, null, i);
    });
    return this;
  }

  nodes() {
    return this.elements;
  }

  size() {
    return this.elements.length;
  }

  empty() {
    return this.elements.length === 0;
  }
}

/**
 * Create a Selection from a DOM element or selector string.
 *
 * @param {string|Element} selector - CSS selector string or DOM element
 * @returns {Selection} New Selection instance
 */
function select(selector) {
  const element =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  return new Selection(element ? [element] : []);
}

/**
 * Get mouse position relative to an SVG element.
 *
 * @param {MouseEvent} event - The mouse event
 * @param {Element|Selection} svgElement - The SVG element or Selection
 * @returns {number[]} [x, y] coordinates relative to the SVG
 */
function getPointerPosition(event, svgElement) {
  const svg =
    svgElement instanceof Selection ? svgElement.nodes()[0] : svgElement;

  if (svg && svg.createSVGPoint) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
    return [transformed.x, transformed.y];
  }

  const rect = svg.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}

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
   * @param {Element|Selection} svg - The target SVG element or Selection (e.g. the entire plot).
   * @param {Element|Selection} tooltip - The tooltip container element or Selection (e.g. a div).
   * @param {number} tooltip_x_shift - Horizontal offset for tooltip positioning.
   * @param {number} tooltip_y_shift - Vertical offset for tooltip positioning.
   */
  constructor(svg, tooltip, tooltip_x_shift, tooltip_y_shift) {
    this.svg = svg instanceof Selection ? svg : select(svg);
    this.tooltip = tooltip instanceof Selection ? tooltip : select(tooltip);
    this.tooltip_x_shift = tooltip_x_shift;
    this.tooltip_y_shift = tooltip_y_shift;
  }

  /**
   * Find bar elements (`patch` groups with clipping) inside a given axes.
   *
   * @param {Selection} svg - Selection of the SVG element.
   * @param {string} axes_class - ID of the axes group (e.g. "axes_1").
   * @returns {Selection} Selection of bar elements.
   */
  findBars(svg, axes_class) {
    // select all #patch within the specific axes
    const bars = svg
      .selectAll(`g#${axes_class} g[id^="patch"]`)
      .filter(function () {
        const path = select(this).select("path");
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
   * @param {Selection} svg - Selection of the SVG element.
   * @param {string} axes_class - ID of the axes group (e.g. "axes_1").
   * @param {string[]} tooltip_groups - Group identifiers for tooltips, parallel to points.
   * @returns {Selection} Selection of point elements.
   */
  findPoints(svg, axes_class, tooltip_groups) {
    let points = svg.selectAll(
      `g#${axes_class} g[id^="PathCollection"] g[clip-path] use`,
    );

    if (points.empty()) {
      // fallback: no <use> found → grab <path> instead
      points = svg.selectAll(`g#${axes_class} g[id^="PathCollection"] path`);
    }

    points.each(function (_, i) {
      select(this).attr("data-group", tooltip_groups[i]);
    });
    points.attr("class", "point plot-element");

    console.log(`Found ${points.size()} "point" element`);
    return points;
  }

  /**
   * Find line elements (`line2d` paths) inside a given axes,
   * excluding axis grid lines.
   *
   * @param {Selection} svg - Selection of the SVG element.
   * @param {string} axes_class - ID of the axes group.
   * @returns {Selection} Selection of line elements.
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
   * @param {Selection} svg - Selection of the SVG element.
   * @param {string} axes_class - ID of the axes group.
   * @returns {Selection} Selection of area elements.
   */
  findAreas(svg, axes_class) {
    // select all <path> of FillBetweenPolyCollection elements within the specific axes
    const areas = svg.selectAll(
      `g#${axes_class} g[id^="FillBetweenPolyCollection"] path`,
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
   * @param {Selection} elements - Selection of candidate elements.
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
   * @param {Selection} plot_element - Selection of plot elements (points, lines, etc.).
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
    hover_nearest,
  ) {
    const self = this;
    const axesGroup = this.svg.select(`g#${axes_class}`);
    const getHoveredIndex = hover_nearest
      ? (event) => {
          const svgNode = self.svg.nodes()[0];
          const [mouseX, mouseY] = getPointerPosition(event, svgNode);
          const allElements = axesGroup.selectAll(".plot-element");
          const nearestElem = self.nearestElementFromMouse(
            mouseX,
            mouseY,
            allElements,
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

export { select };

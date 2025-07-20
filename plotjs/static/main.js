(function () {
  const container = document.getElementById("{{ chart_id }}");
  if (!container) return;

  const tooltip = d3.select("#tooltip-{{ uuid }}");
  const svg = d3.select(container).select("svg");

  const plot_data = JSON.parse(`{{ plot_data_json | tojson | safe }}`);
  let tooltip_label = plot_data["tooltip"];
  let tooltip_group = plot_data["tooltip_group"];

  // no tooltip? no problem
  if (tooltip_label.length === 0) {
    return; // Exit early
  }

  class SVGParser {
    constructor(svg, tooltip, tooltip_label, tooltip_group) {
      this.svg = svg;
      this.tooltip = tooltip;

      const unique_groups = [...new Set(tooltip_group)];
      this.tooltip_label = [...tooltip_label, ...unique_groups];
      this.tooltip_group = [...tooltip_group, ...unique_groups];
    }

    find_bars() {
      // select all #patch
      const bars = this.svg.selectAll('g[id^="patch"]').filter(function () {
        const path = d3.select(this).select("path");

        // that have a clip-path attribute
        const clip = path.attr("clip-path");

        // starting with "url("
        return clip && clip.startsWith("url(");
      });
      bars.attr("class", "bar");

      this.bars = bars;
      return bars;
    }

    find_points() {
      // select all <use> in #PathCollection_1
      const points = this.svg
        .selectAll('g[id^="PathCollection"] use')
        .filter(function () {
          return (
            // not part of the legend handles
            !this.closest('g[id^="legend"]')
          );
        });
      points.attr("class", "point").each(function (_, i) {
        d3.select(this).attr("data-group", this.tooltip_group[i]);
      });

      points_legend_handles = this._find_points_legend_handles();
      points = points.merge(points_legend_handles);

      this.points = points;
      return points;
    }

    find_lines() {
      // select all <path> of Line2D elements
      const lines = this.svg
        .selectAll('g[id^="line2d"] path')
        .filter(function () {
          const clip = d3.select(this).attr("clip-path");

          return (
            // keep only <path> with clip-path attribute
            clip &&
            // that starts with "url("
            clip.startsWith("url(") &&
            // and are not child of a #matplotlib.axis
            !this.closest('g[id^="matplotlib.axis"]')
          );
        });

      lines.attr("class", "line");
      this.lines = lines;
      return lines;
    }

    _find_points_legend_handles() {
      const points_legend_handles = this.svg
        .selectAll('g[id^="PathCollection"] use')
        .filter(function () {
          // only part of the legend handles
          return this.closest('g[id^="legend"]');
        });

      points_legend_handles.attr("class", "legend-point");

      // check if legend handles match tooltip_group
      const unique_groups = [...new Set(this.tooltip_group)];
      const should_connect_legend =
        unique_groups.length === points_legend_handles.size();

      if (should_connect_legend) {
        points_legend_handles.attr("class", "point").each(function (_, i) {
          d3.select(this).attr("data-group", unique_groups[i]);
        });
      }

      this.points_legend_handles = points_legend_handles;
      return points_legend_handles;
    }

    applyHoverEffect(plot_element, labels, groups) {
      plot_element
        .on("mouseover", function (event, d) {
          const nodes = plot_element.nodes();
          const i = nodes.indexOf(this);
          const hovered_group = groups[i];

          // Apply not-hovered to ALL elements first
          const all_elements = points.merge(lines).merge(bars).merge(polygons);
          all_elements.classed("not-hovered", true);

          // Also apply not-hovered to legend points if they exist
          points_legend_handles.classed("not-hovered", true);

          // Highlight main points with matching group
          points
            .filter((_, j) => tooltip_group[j] === hovered_group)
            .classed("not-hovered", false)
            .classed("hovered", true);

          // Highlight legend points with matching group
          points_legend_handles
            .filter((_, j) => unique_groups[j] === hovered_group)
            .classed("not-hovered", false)
            .classed("hovered", true);

          // Highlight other plot elements with matching group (if applicable)
          lines
            .filter((_, j) => tooltip_group[j] === hovered_group)
            .classed("not-hovered", false)
            .classed("hovered", true);
          bars
            .filter((_, j) => tooltip_group[j] === hovered_group)
            .classed("not-hovered", false)
            .classed("hovered", true);
          polygons
            .filter((_, j) => tooltip_group[j] === hovered_group)
            .classed("not-hovered", false)
            .classed("hovered", true);

          this.tooltip
            .style("display", "block")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px")
            .html(labels[i]);
        })
        .on("mouseout", function () {
          const all_elements = points.merge(lines).merge(bars).merge(polygons);
          all_elements.classed("not-hovered", false).classed("hovered", false);

          points_legend_handles
            .classed("not-hovered", false)
            .classed("hovered", false);

          tooltip.style("display", "none");
        });
    }
  }

  svgParser = SVGParser(svg, tooltip, tooltip_label, tooltip_group);

  // find all core plot elements
  lines = svgParser.find_lines();
  bars = svgParser.find_bars();
  polygons = svgParser.find_polygons();
  points = svgParser.find_points();

  // give them the hover effect
  svgParser.applyHoverEffect(points, tooltip_label, tooltip_group);
  svgParser.applyHoverEffect(
    points_legend_handles,
    unique_groups,
    unique_groups
  );
  svgParser.applyHoverEffect(lines, tooltip_label, tooltip_group);
  svgParser.applyHoverEffect(bars, tooltip_label, tooltip_group);
  svgParser.applyHoverEffect(polygons, tooltip_label, tooltip_group);
})();

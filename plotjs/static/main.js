(function () {
  class PlotSVGParser {
    constructor(
      svg,
      tooltip,
      tooltip_labels,
      tooltip_groups,
      show_tooltip,
      tooltip_x_shift,
      tooltip_y_shift
    ) {
      this.svg = svg;
      this.tooltip = tooltip;
      this.tooltip_labels = tooltip_labels;
      this.tooltip_groups = tooltip_groups;
      this.show_tooltip = show_tooltip;
      this.tooltip_x_shift = tooltip_x_shift;
      this.tooltip_y_shift = tooltip_y_shift;
    }

    find_bars(svg) {
      // select all #patch
      const bars = svg.selectAll('g[id^="patch"]').filter(function () {
        const path = d3.select(this).select("path");

        // that have a clip-path attribute
        const clip = path.attr("clip-path");

        // starting with "url("
        return clip && clip.startsWith("url(");
      });

      bars.attr("class", "bar plot-element");
      this.bars = bars;
      return bars;
    }

    find_points(svg) {
      const self = this;
      // select all <use> in #PathCollection_1
      const points = svg.selectAll('g[id^="PathCollection"] use');

      points.attr("class", "point plot-element").each(function (_, i) {
        d3.select(this).attr("data-group", self.tooltip_groups[i]);
      });
      this.points = points;
      return points;
    }

    find_lines(svg) {
      // select all <path> of Line2D elements
      const lines = svg.selectAll('g[id^="line2d"] path').filter(function () {
        return !this.closest('g[id^="matplotlib.axis"]');
      });

      lines.attr("class", "line plot-element");
      this.lines = lines;
      return lines;
    }

    find_areas(svg) {
      // select all <path> of FillBetweenPolyCollection elements
      const areas = svg.selectAll('g[id^="FillBetweenPolyCollection"] path');

      areas.attr("class", "area plot-element");
      this.areas = areas;
      return areas;
    }

    setHoverEffect(plot_element) {
      const self = this;
      plot_element
        .on("mouseover", function (event, d) {
          const nodes = plot_element.nodes();
          let i = nodes.indexOf(this);

          const hovered_group = self.tooltip_groups[i];
          plot_element.classed("not-hovered", true);
          plot_element
            .filter((_, j) => {
              return self.tooltip_groups[j] === hovered_group;
            })
            .classed("not-hovered", false)
            .classed("hovered", true);

          tooltip
            .style("display", self.show_tooltip)
            .style("left", event.pageX + self.tooltip_x_shift + "px")
            .style("top", event.pageY + self.tooltip_y_shift + "px")
            .html(self.tooltip_labels[i]);
        })
        .on("mouseout", function () {
          plot_element.classed("not-hovered", false).classed("hovered", false);
          self.tooltip.style("display", "none");
        });
    }
  }

  const container = document.getElementById("{{ chart_id }}");
  if (!container) return;

  const tooltip = d3.select("#tooltip-{{ uuid }}");
  const svg = d3.select(container).select("svg");

  const plot_data = JSON.parse(`{{ plot_data_json | tojson | safe }}`);
  const tooltip_labels = plot_data["tooltip_labels"];
  const tooltip_groups = plot_data["tooltip_groups"];
  const tooltip_x_shift = plot_data["tooltip_x_shift"];
  const tooltip_y_shift = -plot_data["tooltip_y_shift"];

  // no tooltip? no problem
  if (tooltip_labels.length === 0 && tooltip_groups.length === 0) {
    return; // Exit early
  }
  let show_tooltip;
  if (tooltip_labels.length === 0 && tooltip_groups.length > 0) {
    show_tooltip = "none";
  } else {
    show_tooltip = "block";
  }

  plotParser = new PlotSVGParser(
    svg,
    tooltip,
    tooltip_labels,
    tooltip_groups,
    show_tooltip,
    tooltip_x_shift,
    tooltip_y_shift
  );

  // find all core plot elements
  lines = plotParser.find_lines(svg);
  bars = plotParser.find_bars(svg);
  points = plotParser.find_points(svg);
  areas = plotParser.find_areas(svg);

  // give them the hover effect
  plotParser.setHoverEffect(points);
  plotParser.setHoverEffect(lines);
  plotParser.setHoverEffect(bars);
  plotParser.setHoverEffect(areas);
})();

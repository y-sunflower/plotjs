import { test, expect } from "vitest";
import * as d3 from "d3-selection";
import { JSDOM } from "jsdom";
import PlotSVGParser from "../plotjs/template/plotparser";

test("find_bars should select only patches with clip-path", () => {
  const dom = new JSDOM(`<svg>
    <g id="axes_1">
      <g id="patch_1">
        <path clip-path="url(#clip1)"></path>
      </g>
      <g id="patch_2">
        <path></path> <!-- no clip-path -->
      </g>
    </g>
  </svg>`);
  const svg = d3.select(dom.window.document.querySelector("svg"));
  const parser = new PlotSVGParser(svg, null, 0, 0);

  const bars = parser.find_bars(svg, "axes_1");

  expect(bars.size()).toBe(1);
  bars.each(function () {
    expect(d3.select(this).attr("class")).toBe("bar plot-element");
  });
});

test("find_points should set data-group and class", () => {
  const dom = new JSDOM(`<svg>
    <g id="axes_1">
      <g id="PathCollection_1">
        <use></use>
        <use></use>
      </g>
    </g>
  </svg>`);
  const svg = d3.select(dom.window.document.querySelector("svg"));
  const parser = new PlotSVGParser(svg, null, 0, 0);

  const points = parser.find_points(svg, "axes_1", ["A", "B"]);
  expect(points.size()).toBe(2);

  const nodes = points.nodes();
  expect(nodes[0].getAttribute("data-group")).toBe("A");
  expect(nodes[1].getAttribute("data-group")).toBe("B");
  points.each(function () {
    expect(d3.select(this).attr("class")).toBe("point plot-element");
  });
});

test("setHoverEffect should toggle hovered class and tooltip", () => {
  const dom = new JSDOM(`<html><body>
    <div id="tooltip" style="display: none;"></div>
    <svg>
      <g id="axes_1">
        <g id="PathCollection_1">
          <use></use>
        </g>
      </g>
    </svg>
  </body></html>`);

  const document = dom.window.document;
  const svg = d3.select(document.querySelector("svg"));
  const tooltip = d3.select(document.querySelector("#tooltip"));
  const parser = new PlotSVGParser(svg, tooltip, 10, 20);

  const points = parser.find_points(svg, "axes_1", ["G1"]);

  // Pass all required args: (points, axes_class, tooltip_labels, tooltip_groups, show_tooltip, hover_nearest)
  parser.setHoverEffect(points, "axes_1", ["Label1"], ["G1"], "block", false);

  // simulate mouseover
  points.dispatch("mouseover", { bubbles: true, pageX: 100, pageY: 200 });

  expect(points.classed("hovered")).toBe(true);
  expect(tooltip.style("display")).toBe("block");
  expect(tooltip.html()).toBe("Label1");

  // simulate mouseout
  points.dispatch("mouseout", { bubbles: true });

  expect(points.classed("hovered")).toBe(false);
  expect(tooltip.style("display")).toBe("none");
});

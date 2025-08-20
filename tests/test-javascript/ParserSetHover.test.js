import { test, expect } from "vitest";
import * as d3 from "d3-selection";
import { JSDOM } from "jsdom";
import PlotSVGParser from "../../plotjs/static/plotparser.js";

test("setHoverEffect should toggle hovered class and tooltip", () => {
  const dom = new JSDOM(`<html><body>
    <div id="tooltip" style="display: none;"></div>
    <svg>
      <g id="axes_1">
        <g id="PathCollection_1">
          <g clip-path="url(#pf56c17ca4e)">
            <use></use>
          </g>
        </g>
      </g>
    </svg>
  </body></html>`);

  const document = dom.window.document;
  const svg = d3.select(document.querySelector("svg"));
  const tooltip = d3.select(document.querySelector("#tooltip"));
  const parser = new PlotSVGParser(svg, tooltip, 10, 20);

  const points = parser.findPoints(svg, "axes_1", ["G1"]);

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

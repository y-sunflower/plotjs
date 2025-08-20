import { test, expect } from "vitest";
import * as d3 from "d3-selection";
import { JSDOM } from "jsdom";
import PlotSVGParser from "../../plotjs/static/plotparser.js";

test("findBars should select only patches with clip-path", () => {
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

  const bars = parser.findBars(svg, "axes_1");

  expect(bars.size()).toBe(1);
  bars.each(function () {
    expect(d3.select(this).attr("class")).toBe("bar plot-element");
  });
});

test("findPoints should set data-group and class", () => {
  const dom = new JSDOM(`<svg>
    <g id="axes_1">
      <g id="PathCollection_1">
        <g clip-path="url(#pf56c17ca4e)">
          <use></use>
          <use></use>
        </g>
      </g>
    </g>
  </svg>`);
  const svg = d3.select(dom.window.document.querySelector("svg"));
  const parser = new PlotSVGParser(svg, null, 0, 0);

  const points = parser.findPoints(svg, "axes_1", ["A", "B"]);
  expect(points.size()).toBe(2);

  const nodes = points.nodes();
  expect(nodes[0].getAttribute("data-group")).toBe("A");
  expect(nodes[1].getAttribute("data-group")).toBe("B");
  points.each(function () {
    expect(d3.select(this).attr("class")).toBe("point plot-element");
  });
});

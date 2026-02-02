import { expect, test, describe } from "bun:test";
import { JSDOM } from "jsdom";
import PlotSVGParser from "../../plotjs/static/plotparser.js";

describe("Edge cases", () => {
  describe("Empty and null handling", () => {
    test("findBars with nonexistent axes returns empty selection", () => {
      const dom = new JSDOM(`<svg><g id="axes_1"></g></svg>`);
      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const bars = parser.findBars(parser.svg, "nonexistent_axes");
      expect(bars.size()).toBe(0);
      expect(bars.empty()).toBe(true);
    });

    test("findPoints with nonexistent axes returns empty selection", () => {
      const dom = new JSDOM(`<svg><g id="axes_1"></g></svg>`);
      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const points = parser.findPoints(parser.svg, "nonexistent_axes", []);
      expect(points.size()).toBe(0);
    });

    test("findLines with nonexistent axes returns empty selection", () => {
      const dom = new JSDOM(`<svg><g id="axes_1"></g></svg>`);
      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const lines = parser.findLines(parser.svg, "nonexistent_axes");
      expect(lines.size()).toBe(0);
    });

    test("findAreas with nonexistent axes returns empty selection", () => {
      const dom = new JSDOM(`<svg><g id="axes_1"></g></svg>`);
      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const areas = parser.findAreas(parser.svg, "nonexistent_axes");
      expect(areas.size()).toBe(0);
    });
  });

  describe("Complex SVG structures", () => {
    test("deeply nested PathCollection elements are found", () => {
      const dom = new JSDOM(`<svg>
        <g id="axes_1">
          <g>
            <g>
              <g id="PathCollection_1">
                <g>
                  <use></use>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);
      const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);

      expect(points.size()).toBe(1);
    });

    test("multiple PathCollections with different depths", () => {
      const dom = new JSDOM(`<svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
          <g>
            <g id="PathCollection_2">
              <g><use></use><use></use></g>
            </g>
          </g>
        </g>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);
      const points = parser.findPoints(parser.svg, "axes_1", ["A", "B", "C"]);

      expect(points.size()).toBe(3);
    });

    test("mixed element types in same axes", () => {
      const dom = new JSDOM(`<svg>
        <g id="axes_1">
          <g id="patch_1"><path clip-path="url(#c1)"></path></g>
          <g id="PathCollection_1"><g><use></use></g></g>
          <g id="line2d_1"><path></path></g>
          <g id="FillBetweenPolyCollection_1"><path></path></g>
        </g>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      expect(parser.findBars(parser.svg, "axes_1").size()).toBe(1);
      expect(parser.findPoints(parser.svg, "axes_1", ["G1"]).size()).toBe(1);
      expect(parser.findLines(parser.svg, "axes_1").size()).toBe(1);
      expect(parser.findAreas(parser.svg, "axes_1").size()).toBe(1);
    });
  });

  describe("Selection edge cases", () => {
    test("chaining multiple operations", () => {
      const dom = new JSDOM(`<svg>
        <g id="axes_1">
          <rect class="test"></rect>
        </g>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const result = parser.svg
        .select("#axes_1")
        .select("rect")
        .attr("data-value", "123")
        .classed("highlighted", true)
        .style("opacity", "0.5");

      expect(result.attr("data-value")).toBe("123");
      expect(result.classed("highlighted")).toBe(true);
      expect(result.classed("test")).toBe(true);
    });

    test("selectAll from empty selection returns empty", () => {
      const dom = new JSDOM(`<svg></svg>`);
      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const empty = parser.svg.selectAll(".nonexistent");
      const nested = empty.selectAll("path");

      expect(nested.size()).toBe(0);
    });

    test("filter with false predicate returns empty selection", () => {
      const dom = new JSDOM(`<svg>
        <rect></rect>
        <rect></rect>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      const filtered = parser.svg.selectAll("rect").filter(() => false);
      expect(filtered.size()).toBe(0);
    });

    test("each with no elements does nothing", () => {
      const dom = new JSDOM(`<svg></svg>`);
      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);

      let called = false;
      parser.svg.selectAll(".nonexistent").each(() => {
        called = true;
      });

      expect(called).toBe(false);
    });
  });

  describe("Special characters in selectors", () => {
    test("axes with underscore in id", () => {
      const dom = new JSDOM(`<svg>
        <g id="axes_1_subplot">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
        </g>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);
      const points = parser.findPoints(parser.svg, "axes_1_subplot", ["G1"]);

      expect(points.size()).toBe(1);
    });
  });

  describe("Hover with multiple groups", () => {
    test("all elements in same group get hovered class", () => {
      const dom = new JSDOM(`<html><body>
        <div id="tooltip" style="display: none;"></div>
        <svg>
          <g id="axes_1">
            <g id="PathCollection_1">
              <g>
                <use></use>
                <use></use>
                <use></use>
                <use></use>
              </g>
            </g>
          </g>
        </svg>
      </body></html>`);

      const document = dom.window.document;
      const svg = document.querySelector("svg");
      const tooltip = document.querySelector("#tooltip");
      const parser = new PlotSVGParser(svg, tooltip, 0, 0);

      // 4 points: 2 in GroupA, 2 in GroupB
      const groups = ["GroupA", "GroupA", "GroupB", "GroupB"];
      const labels = ["A1", "A2", "B1", "B2"];
      const points = parser.findPoints(parser.svg, "axes_1", groups);

      parser.setHoverEffect(points, "axes_1", labels, groups, "block", false);

      // Hover third element (first of GroupB)
      const thirdPoint = points.nodes()[2];
      thirdPoint.dispatchEvent(
        new dom.window.MouseEvent("mouseover", {
          bubbles: true,
          currentTarget: thirdPoint,
        }),
      );

      const nodes = points.nodes();
      // GroupA elements should be not-hovered
      expect(nodes[0].classList.contains("not-hovered")).toBe(true);
      expect(nodes[1].classList.contains("not-hovered")).toBe(true);
      // GroupB elements should be hovered
      expect(nodes[2].classList.contains("hovered")).toBe(true);
      expect(nodes[3].classList.contains("hovered")).toBe(true);
    });

    test("single element group", () => {
      const dom = new JSDOM(`<html><body>
        <div id="tooltip" style="display: none;"></div>
        <svg>
          <g id="axes_1">
            <g id="PathCollection_1">
              <g>
                <use></use>
                <use></use>
                <use></use>
              </g>
            </g>
          </g>
        </svg>
      </body></html>`);

      const document = dom.window.document;
      const svg = document.querySelector("svg");
      const tooltip = document.querySelector("#tooltip");
      const parser = new PlotSVGParser(svg, tooltip, 0, 0);

      // Each element in its own group
      const groups = ["G1", "G2", "G3"];
      const points = parser.findPoints(parser.svg, "axes_1", groups);

      parser.setHoverEffect(
        points,
        "axes_1",
        ["L1", "L2", "L3"],
        groups,
        "block",
        false,
      );

      const secondPoint = points.nodes()[1];
      secondPoint.dispatchEvent(
        new dom.window.MouseEvent("mouseover", {
          bubbles: true,
          currentTarget: secondPoint,
        }),
      );

      const nodes = points.nodes();
      expect(nodes[0].classList.contains("not-hovered")).toBe(true);
      expect(nodes[1].classList.contains("hovered")).toBe(true);
      expect(nodes[2].classList.contains("not-hovered")).toBe(true);
    });
  });

  describe("Multiple axes independence", () => {
    test("hover on one axes does not affect another", () => {
      const dom = new JSDOM(`<html><body>
        <div id="tooltip" style="display: none;"></div>
        <svg>
          <g id="axes_1">
            <g id="PathCollection_1">
              <g><use></use></g>
            </g>
          </g>
          <g id="axes_2">
            <g id="PathCollection_2">
              <g><use></use></g>
            </g>
          </g>
        </svg>
      </body></html>`);

      const document = dom.window.document;
      const svg = document.querySelector("svg");
      const tooltip = document.querySelector("#tooltip");
      const parser = new PlotSVGParser(svg, tooltip, 0, 0);

      const points1 = parser.findPoints(parser.svg, "axes_1", ["G1"]);
      const points2 = parser.findPoints(parser.svg, "axes_2", ["G2"]);

      parser.setHoverEffect(
        points1,
        "axes_1",
        ["Axes1 Point"],
        ["G1"],
        "block",
        false,
      );
      parser.setHoverEffect(
        points2,
        "axes_2",
        ["Axes2 Point"],
        ["G2"],
        "block",
        false,
      );

      // Hover point in axes_1
      const point1 = points1.nodes()[0];
      point1.dispatchEvent(
        new dom.window.MouseEvent("mouseover", {
          bubbles: true,
          currentTarget: point1,
        }),
      );

      expect(point1.classList.contains("hovered")).toBe(true);
      // axes_2 point should not be affected
      expect(points2.nodes()[0].classList.contains("hovered")).toBe(false);
      expect(tooltip.innerHTML).toBe("Axes1 Point");
    });
  });

  describe("nearestElementFromMouse edge cases", () => {
    test("with elements at same distance returns first", () => {
      const dom = new JSDOM(`<svg>
        <rect id="r1" x="0" y="0" width="10" height="10"></rect>
        <rect id="r2" x="10" y="0" width="10" height="10"></rect>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);
      const rects = parser.svg.selectAll("rect");

      rects.nodes().forEach((rect) => {
        rect.getBBox = () => ({
          x: parseFloat(rect.getAttribute("x")),
          y: parseFloat(rect.getAttribute("y")),
          width: parseFloat(rect.getAttribute("width")),
          height: parseFloat(rect.getAttribute("height")),
        });
      });

      // Mouse at x=10, y=5 - equidistant from both centers (5,5) and (15,5)
      const nearest = parser.nearestElementFromMouse(10, 5, rects);
      // First element should be returned when distances are equal
      expect(nearest.id).toBe("r1");
    });

    test("with elements at different y positions", () => {
      const dom = new JSDOM(`<svg>
        <rect id="r1" x="0" y="0" width="10" height="10"></rect>
        <rect id="r2" x="0" y="100" width="10" height="10"></rect>
      </svg>`);

      const svg = dom.window.document.querySelector("svg");
      const parser = new PlotSVGParser(svg, null, 0, 0);
      const rects = parser.svg.selectAll("rect");

      rects.nodes().forEach((rect) => {
        rect.getBBox = () => ({
          x: parseFloat(rect.getAttribute("x")),
          y: parseFloat(rect.getAttribute("y")),
          width: parseFloat(rect.getAttribute("width")),
          height: parseFloat(rect.getAttribute("height")),
        });
      });

      // Mouse at (5, 90) - closer to r2 (center at 5, 105)
      const nearest = parser.nearestElementFromMouse(5, 90, rects);
      expect(nearest.id).toBe("r2");
    });
  });
});

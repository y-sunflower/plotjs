import { expect, test, describe, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";

// We need to test the Selection class and select function
// Import the module and extract the classes
const dom = new JSDOM(`<html><body></body></html>`);
global.document = dom.window.document;

// Re-import to get Selection and select
import PlotSVGParser from "../../plotjs/static/plotparser.js";

describe("Selection class", () => {
  let testDom;
  let svg;
  let parser;

  beforeEach(() => {
    testDom = new JSDOM(`<svg>
      <g id="group1" class="myclass">
        <rect id="rect1" width="10" height="10"></rect>
        <rect id="rect2" width="20" height="20"></rect>
      </g>
      <g id="group2">
        <circle id="circle1" r="5"></circle>
      </g>
    </svg>`);
    svg = testDom.window.document.querySelector("svg");
    parser = new PlotSVGParser(svg, null, 0, 0);
  });

  test("constructor wraps single element in array", () => {
    expect(parser.svg.elements).toBeInstanceOf(Array);
    expect(parser.svg.elements.length).toBe(1);
  });

  test("select returns first matching element wrapped in Selection", () => {
    const rect = parser.svg.select("#rect1");
    expect(rect.elements.length).toBe(1);
    expect(rect.elements[0].id).toBe("rect1");
  });

  test("select returns empty Selection when no match", () => {
    const notFound = parser.svg.select("#nonexistent");
    expect(notFound.elements.length).toBe(1);
    expect(notFound.elements[0]).toBeNull();
  });

  test("selectAll returns all matching elements", () => {
    const rects = parser.svg.selectAll("rect");
    expect(rects.size()).toBe(2);
  });

  test("selectAll returns empty Selection when no matches", () => {
    const notFound = parser.svg.selectAll(".nonexistent");
    expect(notFound.size()).toBe(0);
    expect(notFound.empty()).toBe(true);
  });

  test("attr getter returns attribute value", () => {
    const rect = parser.svg.select("#rect1");
    expect(rect.attr("width")).toBe("10");
  });

  test("attr getter returns null for missing attribute", () => {
    const rect = parser.svg.select("#rect1");
    expect(rect.attr("nonexistent")).toBeNull();
  });

  test("attr setter sets attribute and returns this", () => {
    const rect = parser.svg.select("#rect1");
    const result = rect.attr("data-test", "value");
    expect(result).toBe(rect);
    expect(rect.attr("data-test")).toBe("value");
  });

  test("attr setter works on multiple elements", () => {
    const rects = parser.svg.selectAll("rect");
    rects.attr("data-common", "shared");
    expect(rects.nodes()[0].getAttribute("data-common")).toBe("shared");
    expect(rects.nodes()[1].getAttribute("data-common")).toBe("shared");
  });

  test("classed getter returns true when class exists", () => {
    const group = parser.svg.select("#group1");
    expect(group.classed("myclass")).toBe(true);
  });

  test("classed getter returns false when class missing", () => {
    const group = parser.svg.select("#group1");
    expect(group.classed("otherclass")).toBe(false);
  });

  test("classed setter adds class", () => {
    const group = parser.svg.select("#group1");
    group.classed("newclass", true);
    expect(group.classed("newclass")).toBe(true);
  });

  test("classed setter removes class", () => {
    const group = parser.svg.select("#group1");
    group.classed("myclass", false);
    expect(group.classed("myclass")).toBe(false);
  });

  test("classed returns this for chaining", () => {
    const group = parser.svg.select("#group1");
    const result = group.classed("test", true);
    expect(result).toBe(group);
  });

  test("style setter sets inline style", () => {
    const rect = parser.svg.select("#rect1");
    rect.style("display", "none");
    expect(rect.elements[0].style.display).toBe("none");
  });

  test("style returns this for chaining", () => {
    const rect = parser.svg.select("#rect1");
    const result = rect.style("opacity", "0.5");
    expect(result).toBe(rect);
  });

  test("html getter returns innerHTML", () => {
    const group = parser.svg.select("#group1");
    expect(group.html()).toContain("rect");
  });

  test("html setter sets innerHTML", () => {
    const group = parser.svg.select("#group2");
    group.html("<text>Hello</text>");
    expect(group.html()).toBe("<text>Hello</text>");
  });

  test("html returns this for chaining", () => {
    const group = parser.svg.select("#group2");
    const result = group.html("<text>Test</text>");
    expect(result).toBe(group);
  });

  test("on attaches event listener", () => {
    const rect = parser.svg.select("#rect1");
    let clicked = false;
    rect.on("click", () => {
      clicked = true;
    });
    rect.elements[0].dispatchEvent(new testDom.window.Event("click"));
    expect(clicked).toBe(true);
  });

  test("on returns this for chaining", () => {
    const rect = parser.svg.select("#rect1");
    const result = rect.on("click", () => {});
    expect(result).toBe(rect);
  });

  test("filter returns filtered Selection", () => {
    const rects = parser.svg.selectAll("rect");
    const filtered = rects.filter(function () {
      return this.id === "rect1";
    });
    expect(filtered.size()).toBe(1);
    expect(filtered.nodes()[0].id).toBe("rect1");
  });

  test("filter with index parameter", () => {
    const rects = parser.svg.selectAll("rect");
    const filtered = rects.filter(function (_, i) {
      return i === 0;
    });
    expect(filtered.size()).toBe(1);
  });

  test("each iterates over all elements", () => {
    const rects = parser.svg.selectAll("rect");
    const ids = [];
    rects.each(function () {
      ids.push(this.id);
    });
    expect(ids).toContain("rect1");
    expect(ids).toContain("rect2");
  });

  test("each provides index", () => {
    const rects = parser.svg.selectAll("rect");
    const indices = [];
    rects.each(function (_, i) {
      indices.push(i);
    });
    expect(indices).toEqual([0, 1]);
  });

  test("each returns this for chaining", () => {
    const rects = parser.svg.selectAll("rect");
    const result = rects.each(() => {});
    expect(result).toBe(rects);
  });

  test("nodes returns array of elements", () => {
    const rects = parser.svg.selectAll("rect");
    const nodes = rects.nodes();
    expect(nodes).toBeInstanceOf(Array);
    expect(nodes.length).toBe(2);
  });

  test("size returns element count", () => {
    const rects = parser.svg.selectAll("rect");
    expect(rects.size()).toBe(2);
  });

  test("empty returns true for empty selection", () => {
    const notFound = parser.svg.selectAll(".nonexistent");
    expect(notFound.empty()).toBe(true);
  });

  test("empty returns false for non-empty selection", () => {
    const rects = parser.svg.selectAll("rect");
    expect(rects.empty()).toBe(false);
  });
});

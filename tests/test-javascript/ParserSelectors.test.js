import { expect, test, describe } from "bun:test";
import { JSDOM } from "jsdom";
import PlotSVGParser from "../../plotjs/static/plotparser.js";

describe("findBars", () => {
  test("should select only patches with clip-path starting with url(", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="patch_1">
          <path clip-path="url(#clip1)"></path>
        </g>
        <g id="patch_2">
          <path></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const bars = parser.findBars(parser.svg, "axes_1");

    expect(bars.size()).toBe(1);
    bars.each(function () {
      expect(this.getAttribute("class")).toBe("bar plot-element");
    });
  });

  test("should return empty selection when no bars exist", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="other_element"></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const bars = parser.findBars(parser.svg, "axes_1");

    expect(bars.size()).toBe(0);
    expect(bars.empty()).toBe(true);
  });

  test("should ignore patches with clip-path not starting with url(", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="patch_1">
          <path clip-path="none"></path>
        </g>
        <g id="patch_2">
          <path clip-path="inherit"></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const bars = parser.findBars(parser.svg, "axes_1");

    expect(bars.size()).toBe(0);
  });

  test("should find multiple bars", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="patch_1"><path clip-path="url(#clip1)"></path></g>
        <g id="patch_2"><path clip-path="url(#clip2)"></path></g>
        <g id="patch_3"><path clip-path="url(#clip3)"></path></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const bars = parser.findBars(parser.svg, "axes_1");

    expect(bars.size()).toBe(3);
  });

  test("should only find bars within specified axes", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="patch_1"><path clip-path="url(#clip1)"></path></g>
      </g>
      <g id="axes_2">
        <g id="patch_2"><path clip-path="url(#clip2)"></path></g>
        <g id="patch_3"><path clip-path="url(#clip3)"></path></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);

    const bars1 = parser.findBars(parser.svg, "axes_1");
    expect(bars1.size()).toBe(1);

    const bars2 = parser.findBars(parser.svg, "axes_2");
    expect(bars2.size()).toBe(2);
  });
});

describe("findPoints", () => {
  test("should set data-group and class with use elements", () => {
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

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const points = parser.findPoints(parser.svg, "axes_1", ["A", "B"]);

    expect(points.size()).toBe(2);
    const nodes = points.nodes();
    expect(nodes[0].getAttribute("data-group")).toBe("A");
    expect(nodes[1].getAttribute("data-group")).toBe("B");
    points.each(function () {
      expect(this.getAttribute("class")).toBe("point plot-element");
    });
  });

  test("should fallback to path elements when no use elements", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="PathCollection_1">
          <path d="M0,0"></path>
          <path d="M1,1"></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const points = parser.findPoints(parser.svg, "axes_1", ["X", "Y"]);

    expect(points.size()).toBe(2);
    const nodes = points.nodes();
    expect(nodes[0].getAttribute("data-group")).toBe("X");
    expect(nodes[1].getAttribute("data-group")).toBe("Y");
    expect(nodes[0].getAttribute("class")).toBe("point plot-element");
  });

  test("should return empty selection when no points", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="other_element"></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const points = parser.findPoints(parser.svg, "axes_1", []);

    expect(points.size()).toBe(0);
  });

  test("should find points from multiple PathCollections", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="PathCollection_1">
          <g><use></use></g>
        </g>
        <g id="PathCollection_2">
          <g><use></use></g>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const points = parser.findPoints(parser.svg, "axes_1", ["G1", "G2"]);

    expect(points.size()).toBe(2);
  });

  test("should handle mixed group values", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="PathCollection_1">
          <g><use></use><use></use><use></use></g>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const points = parser.findPoints(parser.svg, "axes_1", [
      "GroupA",
      "GroupB",
      "GroupA",
    ]);

    const nodes = points.nodes();
    expect(nodes[0].getAttribute("data-group")).toBe("GroupA");
    expect(nodes[1].getAttribute("data-group")).toBe("GroupB");
    expect(nodes[2].getAttribute("data-group")).toBe("GroupA");
  });
});

describe("findLines", () => {
  test("should find line2d path elements", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="line2d_1">
          <path d="M0,0 L10,10"></path>
        </g>
        <g id="line2d_2">
          <path d="M5,5 L15,15"></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const lines = parser.findLines(parser.svg, "axes_1");

    expect(lines.size()).toBe(2);
    lines.each(function () {
      expect(this.getAttribute("class")).toBe("line plot-element");
    });
  });

  test("should exclude axis grid lines", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="matplotlib.axis_1">
          <g id="line2d_1">
            <path d="M0,0 L10,0"></path>
          </g>
        </g>
        <g id="line2d_2">
          <path d="M5,5 L15,15"></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const lines = parser.findLines(parser.svg, "axes_1");

    expect(lines.size()).toBe(1);
  });

  test("should return empty selection when no lines", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="other"></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const lines = parser.findLines(parser.svg, "axes_1");

    expect(lines.size()).toBe(0);
  });

  test("should only find lines in specified axes", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="line2d_1"><path></path></g>
      </g>
      <g id="axes_2">
        <g id="line2d_2"><path></path></g>
        <g id="line2d_3"><path></path></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);

    expect(parser.findLines(parser.svg, "axes_1").size()).toBe(1);
    expect(parser.findLines(parser.svg, "axes_2").size()).toBe(2);
  });
});

describe("findAreas", () => {
  test("should find FillBetweenPolyCollection path elements", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="FillBetweenPolyCollection_1">
          <path d="M0,0 L10,0 L10,10 Z"></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const areas = parser.findAreas(parser.svg, "axes_1");

    expect(areas.size()).toBe(1);
    areas.each(function () {
      expect(this.getAttribute("class")).toBe("area plot-element");
    });
  });

  test("should find multiple areas", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="FillBetweenPolyCollection_1">
          <path></path>
        </g>
        <g id="FillBetweenPolyCollection_2">
          <path></path>
        </g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const areas = parser.findAreas(parser.svg, "axes_1");

    expect(areas.size()).toBe(2);
  });

  test("should return empty selection when no areas", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="line2d_1"><path></path></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const areas = parser.findAreas(parser.svg, "axes_1");

    expect(areas.size()).toBe(0);
  });

  test("should only find areas in specified axes", () => {
    const dom = new JSDOM(`<svg>
      <g id="axes_1">
        <g id="FillBetweenPolyCollection_1"><path></path></g>
      </g>
      <g id="axes_2">
        <g id="FillBetweenPolyCollection_2"><path></path></g>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);

    expect(parser.findAreas(parser.svg, "axes_1").size()).toBe(1);
    expect(parser.findAreas(parser.svg, "axes_2").size()).toBe(1);
  });
});

describe("nearestElementFromMouse", () => {
  test("should return nearest element by bounding box center", () => {
    const dom = new JSDOM(`<svg xmlns="http://www.w3.org/2000/svg">
      <g id="axes_1">
        <rect id="r1" x="0" y="0" width="10" height="10"></rect>
        <rect id="r2" x="100" y="100" width="10" height="10"></rect>
      </g>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const rects = parser.svg.selectAll("rect");

    // Mock getBBox for jsdom
    rects.nodes().forEach((rect) => {
      rect.getBBox = () => ({
        x: parseFloat(rect.getAttribute("x")),
        y: parseFloat(rect.getAttribute("y")),
        width: parseFloat(rect.getAttribute("width")),
        height: parseFloat(rect.getAttribute("height")),
      });
    });

    // Mouse at (2, 2) should be nearest to r1 (center at 5, 5)
    const nearest = parser.nearestElementFromMouse(2, 2, rects);
    expect(nearest.id).toBe("r1");
  });

  test("should return nearest element when mouse closer to second", () => {
    const dom = new JSDOM(`<svg xmlns="http://www.w3.org/2000/svg">
      <g id="axes_1">
        <rect id="r1" x="0" y="0" width="10" height="10"></rect>
        <rect id="r2" x="100" y="100" width="10" height="10"></rect>
      </g>
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

    // Mouse at (102, 102) should be nearest to r2 (center at 105, 105)
    const nearest = parser.nearestElementFromMouse(102, 102, rects);
    expect(nearest.id).toBe("r2");
  });

  test("should return null for empty selection", () => {
    const dom = new JSDOM(`<svg><g id="axes_1"></g></svg>`);
    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const empty = parser.svg.selectAll(".nonexistent");

    const nearest = parser.nearestElementFromMouse(0, 0, empty);
    expect(nearest).toBeNull();
  });

  test("should handle single element", () => {
    const dom = new JSDOM(`<svg>
      <rect id="single" x="50" y="50" width="10" height="10"></rect>
    </svg>`);

    const svg = dom.window.document.querySelector("svg");
    const parser = new PlotSVGParser(svg, null, 0, 0);
    const rect = parser.svg.selectAll("rect");

    rect.nodes()[0].getBBox = () => ({ x: 50, y: 50, width: 10, height: 10 });

    const nearest = parser.nearestElementFromMouse(0, 0, rect);
    expect(nearest.id).toBe("single");
  });
});

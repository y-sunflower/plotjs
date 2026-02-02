import { expect, test, describe, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import PlotSVGParser from "../../plotjs/static/plotparser.js";

describe("setHoverEffect", () => {
  test("should toggle hovered class and tooltip on direct hover", () => {
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
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 10, 20);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);

    parser.setHoverEffect(points, "axes_1", ["Label1"], ["G1"], "block", false);

    const pointElement = points.nodes()[0];
    const event = new dom.window.MouseEvent("mouseover", {
      bubbles: true,
      clientX: 100,
      clientY: 200,
      pageX: 100,
      pageY: 200,
      currentTarget: pointElement,
    });
    pointElement.dispatchEvent(event);

    expect(points.classed("hovered")).toBe(true);
    expect(tooltip.style.display).toBe("block");
    expect(tooltip.innerHTML).toBe("Label1");

    const outEvent = new dom.window.MouseEvent("mouseout", { bubbles: true });
    pointElement.dispatchEvent(outEvent);

    expect(points.classed("hovered")).toBe(false);
    expect(tooltip.style.display).toBe("none");
  });

  test("should position tooltip with x and y shift", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const xShift = 15;
    const yShift = -25;
    const parser = new PlotSVGParser(svg, tooltip, xShift, yShift);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);
    parser.setHoverEffect(points, "axes_1", ["Label"], ["G1"], "block", false);

    const pointElement = points.nodes()[0];
    // Create event with custom pageX/pageY (jsdom doesn't set these from constructor)
    const event = new dom.window.MouseEvent("mouseover", {
      bubbles: true,
      currentTarget: pointElement,
    });
    Object.defineProperty(event, "pageX", { value: 50 });
    Object.defineProperty(event, "pageY", { value: 100 });
    pointElement.dispatchEvent(event);

    expect(tooltip.style.left).toBe("65px"); // 50 + 15
    expect(tooltip.style.top).toBe("75px"); // 100 + (-25)
  });

  test("should highlight elements with same group", () => {
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

    // Two elements in GroupA, one in GroupB
    const points = parser.findPoints(parser.svg, "axes_1", [
      "GroupA",
      "GroupB",
      "GroupA",
    ]);
    parser.setHoverEffect(
      points,
      "axes_1",
      ["A1", "B1", "A2"],
      ["GroupA", "GroupB", "GroupA"],
      "block",
      false,
    );

    // Hover first element (GroupA)
    const firstPoint = points.nodes()[0];
    const event = new dom.window.MouseEvent("mouseover", {
      bubbles: true,
      pageX: 0,
      pageY: 0,
      currentTarget: firstPoint,
    });
    firstPoint.dispatchEvent(event);

    const nodes = points.nodes();
    // First and third should be hovered (same group)
    expect(nodes[0].classList.contains("hovered")).toBe(true);
    expect(nodes[2].classList.contains("hovered")).toBe(true);
    // Second should be not-hovered (different group)
    expect(nodes[1].classList.contains("not-hovered")).toBe(true);
  });

  test("should not show tooltip when show_tooltip is none", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);
    parser.setHoverEffect(points, "axes_1", ["Label"], ["G1"], "none", false);

    const pointElement = points.nodes()[0];
    const event = new dom.window.MouseEvent("mouseover", {
      bubbles: true,
      pageX: 0,
      pageY: 0,
      currentTarget: pointElement,
    });
    pointElement.dispatchEvent(event);

    expect(tooltip.style.display).toBe("none");
  });

  test("should clear hover states on mouseout", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1", "G2"]);
    parser.setHoverEffect(
      points,
      "axes_1",
      ["L1", "L2"],
      ["G1", "G2"],
      "block",
      false,
    );

    const firstPoint = points.nodes()[0];

    // Hover
    firstPoint.dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 0,
        pageY: 0,
        currentTarget: firstPoint,
      }),
    );

    expect(points.nodes()[0].classList.contains("hovered")).toBe(true);
    expect(points.nodes()[1].classList.contains("not-hovered")).toBe(true);

    // Mouseout
    firstPoint.dispatchEvent(
      new dom.window.MouseEvent("mouseout", { bubbles: true }),
    );

    expect(points.nodes()[0].classList.contains("hovered")).toBe(false);
    expect(points.nodes()[0].classList.contains("not-hovered")).toBe(false);
    expect(points.nodes()[1].classList.contains("hovered")).toBe(false);
    expect(points.nodes()[1].classList.contains("not-hovered")).toBe(false);
    expect(tooltip.style.display).toBe("none");
  });

  test("should work with bar elements", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="patch_1"><path clip-path="url(#c1)"></path></g>
          <g id="patch_2"><path clip-path="url(#c2)"></path></g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const bars = parser.findBars(parser.svg, "axes_1");
    parser.setHoverEffect(
      bars,
      "axes_1",
      ["Bar 1", "Bar 2"],
      ["G1", "G2"],
      "block",
      false,
    );

    const firstBar = bars.nodes()[0];
    firstBar.dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 10,
        pageY: 20,
        currentTarget: firstBar,
      }),
    );

    expect(firstBar.classList.contains("hovered")).toBe(true);
    expect(tooltip.innerHTML).toBe("Bar 1");
  });

  test("should work with line elements", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="line2d_1"><path d="M0,0"></path></g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const lines = parser.findLines(parser.svg, "axes_1");
    parser.setHoverEffect(
      lines,
      "axes_1",
      ["Line 1"],
      ["Series1"],
      "block",
      false,
    );

    const line = lines.nodes()[0];
    line.dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 0,
        pageY: 0,
        currentTarget: line,
      }),
    );

    expect(line.classList.contains("hovered")).toBe(true);
    expect(tooltip.innerHTML).toBe("Line 1");
  });

  test("should work with area elements", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="FillBetweenPolyCollection_1">
            <path d="M0,0 L10,0 L10,10 Z"></path>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const areas = parser.findAreas(parser.svg, "axes_1");
    parser.setHoverEffect(
      areas,
      "axes_1",
      ["Area 1"],
      ["Fill1"],
      "block",
      false,
    );

    const area = areas.nodes()[0];
    area.dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 0,
        pageY: 0,
        currentTarget: area,
      }),
    );

    expect(area.classList.contains("hovered")).toBe(true);
    expect(tooltip.innerHTML).toBe("Area 1");
  });

  test("should show correct label for each element", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use><use></use><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1", "G2", "G3"]);
    parser.setHoverEffect(
      points,
      "axes_1",
      ["First", "Second", "Third"],
      ["G1", "G2", "G3"],
      "block",
      false,
    );

    const nodes = points.nodes();

    // Hover second element
    nodes[1].dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 0,
        pageY: 0,
        currentTarget: nodes[1],
      }),
    );
    expect(tooltip.innerHTML).toBe("Second");

    nodes[1].dispatchEvent(
      new dom.window.MouseEvent("mouseout", { bubbles: true }),
    );

    // Hover third element
    nodes[2].dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 0,
        pageY: 0,
        currentTarget: nodes[2],
      }),
    );
    expect(tooltip.innerHTML).toBe("Third");
  });

  test("should handle HTML content in labels", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);
    parser.setHoverEffect(
      points,
      "axes_1",
      ["<b>Bold</b> and <i>italic</i>"],
      ["G1"],
      "block",
      false,
    );

    points.nodes()[0].dispatchEvent(
      new dom.window.MouseEvent("mouseover", {
        bubbles: true,
        pageX: 0,
        pageY: 0,
        currentTarget: points.nodes()[0],
      }),
    );

    expect(tooltip.innerHTML).toBe("<b>Bold</b> and <i>italic</i>");
  });
});

describe("setHoverEffect with hover_nearest", () => {
  test("should attach mousemove to axes group", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);

    // Mock SVG coordinate transformation
    svg.createSVGPoint = () => ({
      x: 0,
      y: 0,
      matrixTransform: () => ({ x: 5, y: 5 }),
    });
    svg.getScreenCTM = () => ({ inverse: () => ({}) });

    // Mock getBBox for nearest element calculation
    points.nodes()[0].getBBox = () => ({ x: 0, y: 0, width: 10, height: 10 });

    parser.setHoverEffect(
      points,
      "axes_1",
      ["Nearest Label"],
      ["G1"],
      "block",
      true,
    );

    const axesGroup = document.querySelector("#axes_1");
    const event = new dom.window.MouseEvent("mousemove", {
      bubbles: true,
      clientX: 5,
      clientY: 5,
      pageX: 5,
      pageY: 5,
    });
    axesGroup.dispatchEvent(event);

    expect(points.classed("hovered")).toBe(true);
    expect(tooltip.style.display).toBe("block");
    expect(tooltip.innerHTML).toBe("Nearest Label");
  });

  test("should clear hover on mouseout from axes group", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip" style="display: none;"></div>
      <svg>
        <g id="axes_1">
          <g id="PathCollection_1">
            <g><use></use></g>
          </g>
        </g>
      </svg>
    </body></html>`);

    const document = dom.window.document;
    const svg = document.querySelector("svg");
    const tooltip = document.querySelector("#tooltip");
    const parser = new PlotSVGParser(svg, tooltip, 0, 0);

    const points = parser.findPoints(parser.svg, "axes_1", ["G1"]);

    svg.createSVGPoint = () => ({
      x: 0,
      y: 0,
      matrixTransform: () => ({ x: 5, y: 5 }),
    });
    svg.getScreenCTM = () => ({ inverse: () => ({}) });
    points.nodes()[0].getBBox = () => ({ x: 0, y: 0, width: 10, height: 10 });

    parser.setHoverEffect(points, "axes_1", ["Label"], ["G1"], "block", true);

    const axesGroup = document.querySelector("#axes_1");

    // Hover
    axesGroup.dispatchEvent(
      new dom.window.MouseEvent("mousemove", {
        bubbles: true,
        clientX: 5,
        clientY: 5,
        pageX: 5,
        pageY: 5,
      }),
    );
    expect(points.classed("hovered")).toBe(true);

    // Mouseout
    axesGroup.dispatchEvent(
      new dom.window.MouseEvent("mouseout", { bubbles: true }),
    );
    expect(points.classed("hovered")).toBe(false);
    expect(tooltip.style.display).toBe("none");
  });
});

describe("PlotSVGParser constructor", () => {
  test("should accept DOM elements directly", () => {
    const dom = new JSDOM(`<html><body>
      <div id="tooltip"></div>
      <svg id="chart"></svg>
    </body></html>`);

    const svg = dom.window.document.querySelector("svg");
    const tooltip = dom.window.document.querySelector("#tooltip");

    const parser = new PlotSVGParser(svg, tooltip, 5, 10);

    expect(parser.svg.nodes()[0]).toBe(svg);
    expect(parser.tooltip.nodes()[0]).toBe(tooltip);
    expect(parser.tooltip_x_shift).toBe(5);
    expect(parser.tooltip_y_shift).toBe(10);
  });

  test("should handle null tooltip", () => {
    const dom = new JSDOM(`<svg></svg>`);
    const svg = dom.window.document.querySelector("svg");

    const parser = new PlotSVGParser(svg, null, 0, 0);

    expect(parser.svg.nodes()[0]).toBe(svg);
  });
});

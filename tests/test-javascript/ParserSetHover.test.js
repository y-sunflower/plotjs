import { expect, test } from "bun:test";
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

import { ceil, child, positionSet, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeCreate } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RoundedRectData} roundedRectData
 */
export function ellipse4(svg, canvasData, roundedRectData) {
    // Set default dimensions if not provided
    roundedRectData.width = roundedRectData.width ?? 144;
    roundedRectData.height = roundedRectData.height ?? 72;
    roundedRectData.rx = roundedRectData.rx ?? 12;
    roundedRectData.ry = roundedRectData.ry ?? 12;

    // Define the SVG template for the rounded rectangle
    const templ = `
        <rect data-key="outer" data-evt-no data-evt-index="2" width="${roundedRectData.width}" height="${roundedRectData.height}" x="${-roundedRectData.width / 2}" y="${-roundedRectData.height / 2}" fill="transparent" stroke="#5E1675" stroke-width="2" />
        <rect data-key="main" width="${roundedRectData.width}" height="${roundedRectData.height}" x="${-roundedRectData.width / 2}" y="${-roundedRectData.height / 2}" rx="${roundedRectData.rx}" ry="${roundedRectData.ry}" fill="#fb8500" stroke="#fff" stroke-width="1" />
        <text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>`;

    // Create the shape
    const shape = shapeCreate(svg, canvasData, roundedRectData, templ,
        {
            right: { dir: 'right', position: { x: roundedRectData.width / 2 + 1, y: 0 } },
            left: { dir: 'left', position: { x: -roundedRectData.width / 2, y: 0 } },
            bottom: { dir: 'bottom', position: { x: 0, y: roundedRectData.height / 2 } },
            top: { dir: 'top', position: { x: 0, y: -roundedRectData.height / 2 } }
        },
        // onTextChange
        txtEl => {
            // Update radius based on the farthest point of the text element
            const newRadiusX = textElRadius(txtEl, roundedRectData.rx, 12);
            const newRadiusY = textElRadius(txtEl, roundedRectData.ry, 6);
            if (newRadiusX !== roundedRectData.rx || newRadiusY !== roundedRectData.ry) {
                roundedRectData.rx = newRadiusX;
                roundedRectData.ry = newRadiusY;
                resize();
            }
        });

    // Resize function
    function resize() {
        // Update connector positions
        shape.cons.right.position.x = roundedRectData.width / 2;
        shape.cons.left.position.x = -roundedRectData.width / 2;
        shape.cons.bottom.position.y = roundedRectData.height / 2;
        shape.cons.top.position.y = -roundedRectData.height / 2;

        // Set connector positions
        for (const connectorKey in shape.cons) {
            positionSet(child(shape.el, connectorKey), shape.cons[connectorKey].position);
        }

        // Set the dimensions and radii of the main and outer rectangles
        rectSet(shape.el, 'outer', roundedRectData.width + 20, roundedRectData.height + 20, -10, -10);
        rectSet(shape.el, 'main', roundedRectData.width, roundedRectData.height, -roundedRectData.width / 2, -roundedRectData.height / 2);

        // Redraw the shape
        shape.draw();
    }

    // Check if dimensions and radii are provided and not default
    if (
        !!roundedRectData.width &&
        roundedRectData.width !== 144 &&
        !!roundedRectData.height &&
        roundedRectData.height !== 72 &&
        !!roundedRectData.rx &&
        roundedRectData.rx !== 12 &&
        !!roundedRectData.ry &&
        roundedRectData.ry !== 12
    ) {
        resize();
    } else {
        shape.draw();
    }

    // Return the created shape element
    return shape.el;
}

/**
 * Set the dimensions and radii of a rectangle element.
 * @param {Element} svgGrp 
 * @param {string} key 
 * @param {number} w 
 * @param {number} h 
 * @param {number} x 
 * @param {number} y 
 */
function rectSet(svgGrp, key, w, h, x, y) {
    const rect = child(svgGrp, key);
    rect.width.baseVal.value = w;
    rect.height.baseVal.value = h;
    rect.x.baseVal.value = x;
    rect.y.baseVal.value = y;
}

/**
 * Calculate radius that covers all <tspan> in SVGTextElement.
 * @param {SVGTextElement} textEl 
 * @param {number} minR 
 * @param {number} step 
 * @returns {number} The calculated radius.
 */
function textElRadius(textEl, minR, step) {
    const farthestPoint = svgTxtFarthestPoint(textEl);
    return ceil(minR, step, Math.sqrt(farthestPoint.x ** 2 + farthestPoint.y ** 2));
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc').ConnectorsData } ConnectorsData */
/** @typedef { {type:number, position: Point, title?: string, styles?: string[], width?:number, height?:number, rx?:number, ry?:number} } RoundedRectData */

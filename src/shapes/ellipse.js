import { ceil, child, positionSet, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeCreate } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {EllipseData} ellipseData
 */
export function ellipse(svg, canvasData, ellipseData) {
    // Set default radii if not provided
    ellipseData.rx = ellipseData.rx ?? 72;
    ellipseData.ry = ellipseData.ry ?? 36;

    // Define the SVG template for the ellipse
    const templ = `
        <ellipse data-key="outer" data-evt-no data-evt-index="2" rx="72" ry="36" fill="transparent" stroke-width="0" />
        <ellipse data-key="main" rx="48" ry="24" fill="#fb8500" stroke="#fff" stroke-width="1" />
        <text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>`;

    // Create the shape
    const shape = shapeCreate(svg, canvasData, ellipseData, templ,
        {
            right: { dir: 'right', position: { x: 48, y: 0 } },
            left: { dir: 'left', position: { x: -48, y: 0 } },
            bottom: { dir: 'bottom', position: { x: 0, y: 24 } },
            top: { dir: 'top', position: { x: 0, y: -24 } }
        },
        // onTextChange
        txtEl => {
            const newRadiusX = textElRadius(txtEl, 48, 24);
            const newRadiusY = textElRadius(txtEl, 24, 12);
            if (newRadiusX !== ellipseData.rx || newRadiusY !== ellipseData.ry) {
                ellipseData.rx = newRadiusX;
                ellipseData.ry = newRadiusY;
                resize();
            }
        });

    // Resize function
    function resize() {
        // Update connector positions
        shape.cons.right.position.x = ellipseData.rx;
        shape.cons.left.position.x = -ellipseData.rx;
        shape.cons.bottom.position.y = ellipseData.ry;
        shape.cons.top.position.y = -ellipseData.ry;

        // Set connector positions
        for (const connectorKey in shape.cons) {
            positionSet(child(shape.el, connectorKey), shape.cons[connectorKey].position);
        }

        // Set the radii of the main and outer ellipses
        radiusSet(shape.el, 'outer', ellipseData.rx + 24, ellipseData.ry + 24);
        radiusSet(shape.el, 'main', ellipseData.rx, ellipseData.ry);

        // Redraw the shape
        shape.draw();
    }

    // Check if radii are provided and not default
    if (!!ellipseData.rx && ellipseData.rx !== 48 && !!ellipseData.ry && ellipseData.ry !== 24) {
        resize();
    } else {
        shape.draw();
    }

    // Return the created shape element
    return shape.el;
}

/** 
 * Set the radii of an ellipse element.
 * @param {Element} svgGrp 
 * @param {string} key 
 * @param {number} rx 
 * @param {number} ry 
 */
function radiusSet(svgGrp, key, rx, ry) { 
    /** @type {SVGEllipseElement} */
    const ellipse = child(svgGrp, key);
    ellipse.rx.baseVal.value = rx; 
    ellipse.ry.baseVal.value = ry; 
}

/**
 * Calculate radius that covers all <tspan> in SVGTextElement.
 * Origin is in the center of the ellipse.
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
/** @typedef { {type:number, position: Point, title?: string, styles?: string[], rx?:number, ry?:number} } EllipseData */

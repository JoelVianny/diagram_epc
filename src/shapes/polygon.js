import { ceil, child, positionSet, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeCreate } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {PolygonData} polygonData
 */
export function polygon(svg, canvasData, polygonData) {
    // Set default radii if not provided
    polygonData.rx = polygonData.rx ?? 72;
    polygonData.ry = polygonData.ry ?? 36;

    // Define the SVG template for the polygon
    const templ = `
    <polygon data-key="outer" data-evt-no data-evt-index="2" points="144,72 108,36 36,36 0,72 36,108 108,108" fill="transparent" stroke-width="0" />
    <polygon data-key="main" points="96,48 72,24 24,24 0,48 24,72 72,72" fill="#fb8500" stroke="#fff" stroke-width="1" />
    <text data-key="text" x="48" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>`; // Adjusted text position

    // Create the shape
    const shape = shapeCreate(svg, canvasData, polygonData, templ,
        {
            right: { dir: 'right', position: { x: 96, y: 48 } },
            left: { dir: 'left', position: { x: 0, y: 48 } },
            bottom: { dir: 'bottom', position: { x: 48, y: 72 } },
            top: { dir: 'top', position: { x: 48, y: 24 } }
        },
        // onTextChange
        txtEl => {
            const newRadiusX = textElRadius(txtEl, 48, 24);
            const newRadiusY = textElRadius(txtEl, 24, 12);
            if (newRadiusX !== polygonData.rx || newRadiusY !== polygonData.ry) {
                polygonData.rx = newRadiusX;
                polygonData.ry = newRadiusY;
                resize();
            }
        });

    // Resize function
    function resize() {
        // Update connector positions
        shape.cons.right.position.x = 96;
        shape.cons.left.position.x = 0;
        shape.cons.bottom.position.y = 72;
        shape.cons.top.position.y = 24;
        
        classAdd(shape.el, polyData.t ? 'shtxt' : 'shrect');
        // Set connector positions
        for (const connectorKey in shape.cons) {
            positionSet(child(shape.el, connectorKey), shape.cons[connectorKey].position);
        }

        // Set the radii of the main and outer ellipses
        radiusSet(shape.el, 'outer', polygonData.rx + 24, polygonData.ry + 24);
        radiusSet(shape.el, 'main', polygonData.rx, polygonData.ry);

        // Adjust text position
        const txtEl = child(shape.el, 'text');
        txtEl.y.baseVal[0].value = polygonData.t ? 0 : 12; // Adjusted text position vertically for visibility

        shape.draw();
    }

    // Check if radii are provided and not default
    if (!!polygonData.rx && polygonData.rx !== 72 && !!polygonData.ry && polygonData.ry !== 36) {
        resize();
    } else {
        shape.draw();
    }

    return shape.el;
}

/**
 * calc radius that cover all <tspan> in SVGTextElement
 * origin is in the center of the circle
 * @param {SVGTextElement} textEl
 * @param {*} minR
 * @param {*} step
 */
function textElRadius(textEl, minR, step) {
    const farthestPoint = svgTxtFarthestPoint(textEl);
    return ceil(minR, step, Math.sqrt(farthestPoint.x ** 2 + farthestPoint.y ** 2));
}

/** 
 * Set the radii of an ellipse element.
 * @param {Element} svgGrp 
 * @param {string} key 
 * @param {number} r 
 */
function radiusSet(svgGrp, key, r) { 
    /** @type {SVGEllipseElement} */
    const ellipse = child(svgGrp, key);
    ellipse.rx.baseVal.value = r; 
    ellipse.ry.baseVal.value = r; 
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc').ConnectorsData } ConnectorsData */
/** @typedef { {type:number, position: Point, title?: string, styles?: string[], rx?:number, ry?:number, t?:boolean} } PolygonData */

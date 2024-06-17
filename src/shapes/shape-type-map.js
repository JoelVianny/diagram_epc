import { circle } from './circle.js';
import { path } from './path.js';
import { rect } from './rect.js';
import { ellipse } from './ellipse.js';
import { rectangle } from './rectangle.js';
import { rhomb } from './rhomb.js';
import { square } from './square.js';
import { polygon } from './polygon.js';
import { ellipse1 } from './ellipse1.js';
import { rhomb1 } from './rhomb1.js';
import { rhomb2 } from './rhomb2.js';
import { square2 } from './square2.js';
import { square4 } from './square4.js';
import { ellipse4 } from './ellipse4.js';





/**
 * @param {Element} svg
 * @param {{position:Point, scale:number, cell:number}} canvasData
 * @returns {Record<number, ShapeType>}
 */
export function shapeTypeMap(svg, canvasData) {
	return {
		0: { create: shapeData => path(svg, canvasData, shapeData) },
		1: { create: shapeData => circle(svg, canvasData, shapeData) },
		2: { create: shapeData => rect(svg, canvasData, shapeData) },
		3: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return rect(svg, canvasData, shapeData); } },
		4: { create: shapeData => rhomb(svg, canvasData, shapeData) },
		5: { create: shapeData => ellipse(svg, canvasData, shapeData) },
		6: { create: shapeData => rectangle(svg, canvasData, shapeData) },
		7: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return rectangle(svg, canvasData, shapeData); } },
		8: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return ellipse(svg, canvasData, shapeData); } },
		9: { create: shapeData => square(svg, canvasData, shapeData) },
		10: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return square(svg, canvasData, shapeData); } },
		11: { create: shapeData => polygon(svg, canvasData, shapeData) },
		12: { create: shapeData => ellipse1(svg, canvasData, shapeData) },
		13: { create: shapeData => rhomb1(svg, canvasData, shapeData) },
		15: { create: shapeData => square2(svg, canvasData, shapeData) },
		14: { create: shapeData => rhomb2(svg, canvasData, shapeData) },
		16: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return square2(svg, canvasData, shapeData); } },
		17: { create: shapeData => ellipse4(svg, canvasData, shapeData) },
		18: { create: shapeData => square4(svg, canvasData, shapeData) },
		19: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return square4(svg, canvasData, shapeData); } }


	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef {import('./rect.js').RectData} RectData */
/** @typedef {import('./rectangle.js').RectangleData} RectData */
/** @typedef {import('./polygon.js').PolygonData} PolygonData */




/**
@typedef {{
	create: (shapeData)=>SVGGraphicsElement
}} ShapeType
*/

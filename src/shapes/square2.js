import { ceil, child, classAdd, classDel, positionSet } from '../infrastructure/util.js';
import { rectTxtSettingsPnlCreate } from './rect-txt-settings.js';
import { shapeCreate } from './shape-evt-proc.js';
import { settingsPnlCreate } from './shape-settings.js';
import { ShapeSmbl } from './shape-smbl.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RectData} rectData
 */
export function square2(svg, canvasData, rectData) {
    rectData.w = rectData.w ?? 144; // Reduced width
    rectData.h = rectData.h ?? 50; // Reduced height
    rectData.a = rectData.a ?? (rectData.t ? 1 : 2);

    const templ = `
    <rect data-key="outer" data-evt-no data-evt-index="2" width="${rectData.w}" height="${rectData.h}" x="${-rectData.w / 2}" y="${-rectData.h / 2}" fill="transparent" stroke="#5E1675" stroke-width="2" />
    <rect data-key="main" width="${rectData.w}" height="${rectData.h}" x="${-rectData.w / 2}" y="${-rectData.h / 2}" fill="#F6FDC3" stroke="#00224D" stroke-width="1" />
    <text data-key="text" y="0" x="${rectTxtXByAlign(rectData)}" style="pointer-events: none;" fill="#5E1675">&nbsp;</text>
    <line x1="${-rectData.w / 2 + 10}" y1="${-rectData.h / 2}" x2="${-rectData.w / 2 + 10}" y2="${rectData.h / 2}" stroke="#00224D" stroke-width="1" />`;

    const shape = shapeCreate(svg, canvasData, rectData, templ,
        {
            right: { dir: 'right', position: { x: rectData.w / 2 + 1, y: 0 } },
            left: { dir: 'left', position: { x: -rectData.w / 2, y: 0 } },
            bottom: { dir: 'bottom', position: { x: 0, y: rectData.h / 2 } },
            top: { dir: 'top', position: { x: 0, y: -rectData.h / 2 } }
        },
        txtEl => {
            const textBox = txtEl.getBBox();
            const newWidth = ceil(144, 144, textBox.width + (rectData.t ? 6 : 0)); // Adjusted width for the information box
            const newHeight = ceil(50, 144, textBox.height); // Adjusted height for the information box

            if (rectData.w !== newWidth || rectData.h !== newHeight) {
                rectData.w = newWidth;
                rectData.h = newHeight;
                resize();
            }
        },
        rectData.t ? rectTxtSettingsPnlCreate : settingsPnlCreate);

    classAdd(shape.el, rectData.t ? 'shtxt' : 'shrect');

    let currentW = rectData.w;
    let currentTxtAlign = rectData.a;

    function resize(fixTxtAlign) {
        const mainX = rectData.w / -2;
        const mainY = rectData.h / -2;
        const middleX = 0;

        shape.cons.right.position.x = -mainX;
        shape.cons.left.position.x = mainX;
        shape.cons.bottom.position.y = -mainY;
        shape.cons.bottom.position.x = middleX;
        shape.cons.top.position.y = mainY;
        shape.cons.top.position.x = middleX;
rectSet(shape.el, 'main', rectData.w, rectData.h, mainX, mainY);
  rectSet(shape.el, 'outer', rectData.w + 20, rectData.h + 20, mainX - 10, mainY - 10);

        if (fixTxtAlign || currentTxtAlign !== rectData.a || currentW !== rectData.w) {
            let txtX;
            let posXDelta;
            switch (rectData.a) {
                // text align left
                case 1:
                    txtX = mainX + 8;
                    posXDelta = (rectData.w - currentW) / 2;
                    break;
                case 2:
                    txtX = 0;
                    posXDelta = 0;
                    break;
                // text align right
                case 3:
                    txtX = -mainX - 8;
                    posXDelta = (rectData.w - currentW) / -2;
                    break;
            }

            const txtEl = child(shape.el, 'text');
            txtEl.x.baseVal[0].value = txtX;
            txtEl.querySelectorAll('tspan').forEach(ss => { ss.x.baseVal[0].value = txtX; });

            rectData.position.x += posXDelta;

            classDel(shape.el, `ta-${currentTxtAlign}`);
            classAdd(shape.el, `ta-${rectData.a}`);

            currentTxtAlign = rectData.a;
            currentW = rectData.w;
        }

        shape.draw();
    }

    classAdd(shape.el, `ta-${rectData.a}`);
    if (rectData.w !== 144 || rectData.h !== 50) { resize(true); } else { shape.draw(); }

    shape.el[ShapeSmbl].draw = resize;

    return shape.el;
}

/**
 * @param {Element} svgGrp, @param {string} key,
 * @param {number} w, @param {number} h
 * @param {number} x, @param {number} y
 */
function rectSet(svgGrp, key, w, h, x, y) {
    const rect = child(svgGrp, key);
    rect.width.baseVal.value = w;
    rect.height.baseVal.value = h;
  
    // Calculate proportional positions for lines and text based on center (x + w / 2)
    const centerX = x + w / 2;
    const lineOffsetX = 10; // Adjust line offset as needed
  
    if (key === 'main') {
      // Update text position based on alignment (already defined in rectTxtXByAlign)
      const txtEl = child(svgGrp, 'text');
      txtEl.x.baseVal[0].value = centerX + rectTxtXByAlign(rectData);
    } else if (key === 'line') {
      // Update line positions based on center and offset
      const line1 = child(svgGrp, `line-${key}-1`);
      line1.x1.baseVal.value = centerX - lineOffsetX;
      line1.x2.baseVal.value = centerX - lineOffsetX;
  
      const line2 = child(svgGrp, `line-${key}-2`);
      line2.x1.baseVal.value = centerX + lineOffsetX;
      line2.x2.baseVal.value = centerX + lineOffsetX;
    }
  
    rect.y.baseVal.value = y;
  }

const rectTxtXByAlign = rectData => rectData.a === 1 ? -40 : rectData.a === 2 ? 0 : 40; // Adjusted text position for different alignments

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc').ConnectorsData } ConnectorsData */
/**
@typedef {{
	type:number, position: Point, title?: string, styles?: string[],
	w?:number, h?:number
	t?:boolean,
	a?: 1|2|3
}} RectData */

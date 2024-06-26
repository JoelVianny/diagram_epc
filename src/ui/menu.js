import { dgrmClear } from '../diagram/dgrm-clear.js';
import { dgrmPngChunkGet, dgrmPngCreate } from '../diagram/dgrm-png.js';
import { deserialize, serialize } from '../diagram/dgrm-serialization.js';
import { generateKey, srvSave } from '../diagram/dgrm-srv.js';
import { fileOpen, fileSave } from '../infrastructure/file.js';
import { tipShow, uiDisable } from './ui.js';

export class Menu extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
			<style>
			.menu {
				position: fixed;
				top: 15px;
				left: 15px;
				cursor: pointer;
			}
			#options {
				position: fixed;
				padding: 30px;
				box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%);
				border-radius: 16px;
				background-color: #FEFAF6;

				top: 0px;
				left: 0px;

				z-index: 1;
			}

			#options div, #options a { 
				color: rgb(13, 110, 253); 
				cursor: pointer; margin: 10px 0;
				display: flex;
				align-items: center;
				line-height: 25px;
				text-decoration: none;
			}
			#options div svg, #options a svg { margin-right: 10px; }
			</style>
			<svg id="menu" class="menu" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgb(52,71,103)"/></svg>
			<div id="options" style="visibility: hidden;">
			 	<div id="menu2" style="margin: 0 0 15px;"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgb(52,71,103)"/></svg></div>
				<div id="new"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 2.003V2h10.998C20.55 2 21 2.455 21 2.992v18.016a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 20.993V8l6-5.997zM5.83 8H9V4.83L5.83 8zM11 4v5a1 1 0 0 1-1 1H5v10h14V4h-8z" fill="rgb(52,71,103)"/></svg>Новая диаграмма</div>
				<div id="open"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 21a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H20a1 1 0 0 1 1 1v3h-2V7h-7.414l-2-2H4v11.998L5.5 11h17l-2.31 9.243a1 1 0 0 1-.97.757H3zm16.938-8H7.062l-1.5 6h12.876l1.5-6z" fill="rgb(52,71,103)"/></svg>Открыть диаграмму</div>
				<div id="save"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" fill="rgb(52,71,103)"/></svg>Экспорт диаграмм</div>
				<div id="export"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/> <path d="M8 5.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10l-4-4V5.5zM8 3.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 1 0v-12a.5.5 0 0 0-.5-.5z" fill="rgb(52,71,103)"/></svg>Сохранить диаграмму</div>

			
		 	</div>`;

		const options = shadow.getElementById('options');
		function toggle() { options.style.visibility = options.style.visibility === 'visible' ? 'hidden' : 'visible'; }

		/** @param {string} id, @param {()=>void} handler */
		function click(id, handler) {
			shadow.getElementById(id).onclick = _ => {
				uiDisable(true);
				handler();
				toggle();
				uiDisable(false);
			};
		}

		shadow.getElementById('menu').onclick = toggle;
		shadow.getElementById('menu2').onclick = toggle;

		click('new', () => { dgrmClear(this._canvas); tipShow(true); });

		click('save', () => {
			const serialized = serialize(this._canvas);
			if (serialized.s.length === 0) { alertEmpty(); return; }

			dgrmPngCreate(
				this._canvas,
				this._canvasData,
				JSON.stringify(serialized),
				png => fileSave(png, 'dgrm.png')); // TODO: check await
		});

		click('export', () => {
			const serialized = serialize(this._canvas);
			if (serialized.s.length === 0) { alertEmpty(); return; }

			dgrmPngCreate(
				this._canvas,
				this._canvasData,
				JSON.stringify(serialized),
				png => fileSave(png, 'dgrm.png')); // TODO: check await
		});

		click('open', () =>
			fileOpen('.png', async png => await loadData(this._canvas, this._shapeTypeMap, png))
		);

		click('link', async () => {
			const serialized = serialize(this._canvas);
			if (serialized.s.length === 0) { alertEmpty(); return; }

			const key = generateKey();
			const url = new URL(window.location.href);
			url.searchParams.set('k', key);
			// use clipboard before server call - to fix 'Document is not focused'
			await navigator.clipboard.writeText(url.toString());
			await srvSave(key, serialized);

			alert('Link to diagram copied to clipboard');
		});
	}

	/**
	 * @param {SVGGElement} canvas
	 * @param {{position:Point, scale:number, cell:number}} canvasData
	 * @param {Record<number, {create :(shapeData)=>SVGGraphicsElement}>} shapeTypeMap
	 */
	init(canvas, canvasData, shapeTypeMap) {
		/** @private */ this._canvas = canvas;
		/** @private */ this._canvasData = canvasData;
		/** @private */ this._shapeTypeMap = shapeTypeMap;

		// file drag to window
		document.body.addEventListener('dragover', evt => { evt.preventDefault(); });
		document.body.addEventListener('drop', async evt => {
			evt.preventDefault();

			if (evt.dataTransfer?.items?.length !== 1 ||
				evt.dataTransfer.items[0].kind !== 'file' ||
				evt.dataTransfer.items[0].type !== 'image/png') {
				alertCantOpen(); return;
			}

			await loadData(this._canvas, this._shapeTypeMap, evt.dataTransfer.items[0].getAsFile());
		});
	}
};
customElements.define('ap-menu', Menu);

/**
 * @param {SVGGElement} canvas
 * @param {Record<number, {create :(shapeData)=>SVGGraphicsElement}>} shapeTypeMap
 * @param {Blob} png
 */
async function loadData(canvas, shapeTypeMap, png) {
	const dgrmChunk = await dgrmPngChunkGet(png);
	if (!dgrmChunk) { alertCantOpen(); return; }
	if (deserialize(canvas, shapeTypeMap, JSON.parse(dgrmChunk))) {
		tipShow(false);
	}
}

const alertCantOpen = () => alert('File cannot be read. Use the exact image file you got from the application.');
const alertEmpty = () => alert('Diagram is empty');

/** @typedef { {x:number, y:number} } Point */

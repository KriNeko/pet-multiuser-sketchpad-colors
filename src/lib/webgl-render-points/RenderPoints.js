
import { WGL } from './helpers/webgl.js'
import { parseNormalizeColorHEX } from './helpers/utils.js'
import { DrawGrid } from './DrawGrid.js'
import { DrawPoints } from './DrawPoints.js'
import { DrawPointsInstanced } from './DrawPointsInstanced.js'
import { DrawTexture } from './DrawTexture.js'
import { FrameBufferTexture } from './FrameBufferTexture.js'

window.addEventListener('error', (msg, url, line, col, error) => {
	const extra = (!col ? '' : '\ncolumn: ' + col) + ( !error ? '' : '\nerror: ' + error )
	alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra)
})


export class RenderPoints {
	constructor(canvas, options) {
		this.canvas = canvas
		this.options = {
			backgroundColorHEX: '#FFFFFFFF',
			
			gridColorHEX: '#CCCCCC50',
			gridCellWidth: 40,
			
			...options
		}

		this.wgl = new WGL(this.canvas, {
			alpha: false,
			depth: false,
			stencil: false,
			antialias: false,
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
			//failIfMajorPerformanceCaveat: true,
			
			...this.options
		})

		this.needReset = true
		
		this.frameBufferTexture = new FrameBufferTexture(this.wgl, {
			width : 1000,
			height: 1000,
		})
		
		this.wgl.viewport(this.frameBufferTexture.width, this.frameBufferTexture.height)

		this.drawGrid = new DrawGrid(this.wgl, {
			gridColorHEX: '#CCCCCC50',
			gridCellWidth: 40,
			...this.options,
		})
		this.drawTexture = new DrawTexture(this.wgl)
		
		this.drawPoints = this.wgl.supportedExtension('instanced_arrays') ?
			new DrawPointsInstanced(this.wgl) :
			new DrawPoints(this.wgl)
		this.addPoint = this.drawPoints.addPoint.bind( this.drawPoints )

		this.viewX = 0
		this.viewY = 0
		this.scale = 1
		
		this._init()
		
		
		this.isDeleted = false
		const loop = () => 
			requestAnimationFrame(() => {
				if ( this.isDeleted )
					return
				
				loop()
				this.draw()
			}, this.canvas)
		loop()
		
		globalThis.gl = this.wgl.gl
		globalThis.wgl = this.wgl
		globalThis.renderPoints = this
	}
	
	reset() {
		this.needReset = true
		this.drawPoints.reset()
	}
	addPoint() {}

	_init() {
		const { gl } = this.wgl
		
		gl.disable(gl.DEPTH_TEST)
		gl.disable(gl.CULL_FACE)
		gl.disable(gl.BLEND)
		gl.clearColor( ...parseNormalizeColorHEX(this.options.backgroundColorHEX) )
	}
	_clear() {
		gl.clear(gl.COLOR_BUFFER_BIT)
	}
	draw() {
		const { gl } = this.wgl
		
		this._clear()

		this.frameBufferTexture.begin()

		if ( this.needReset ) {
			this._clear()
			this.drawGrid.draw()
			this.needReset = false
		}

		this.drawPoints.draw()

		this.frameBufferTexture.end()
		
		//console.log( this.viewWidth, this.viewHeight )
		this.wgl.viewport(this.viewWidth, this.viewHeight)
		
		this.drawTexture.drawTexture( this.frameBufferTexture.glTextureRender, 
			this.frameBufferTexture.width  / 2 - this.viewWidth  / 2 + this.viewX,
			this.frameBufferTexture.height / 2 - this.viewHeight / 2 + this.viewY,
			this.viewWidth, 
			this.viewHeight,
			
			this.frameBufferTexture.width,
			this.frameBufferTexture.height,
			
			this.scale
		)
	}
	
	transformPos(x, y) {
		x = x - this.viewWidth  / 2 + this.viewX * this.scale
		y = y - this.viewHeight / 2 + this.viewY * this.scale
		x /= this.scale
		y /= this.scale
		return [ x, y ]
	}

	delete() {
		this.drawGrid.delete()
		this.drawPoints.delete()
		this.isDeleted = true
	}
	
	get viewWidthHalf () { return this.viewWidth  / 2 }
	get viewHeightHalf() { return this.viewHeight / 2 }
	
	addViewPos(x, y) {
		this.viewX += x / this.scale
		this.viewY += y / this.scale
		this._update()
	}
	addScale(s, x, y) {
		s = Math.sign(s)
		
		const addScale = s * 0.1
		
		this.scale += addScale
		
		if ( s > 0 ) {
			this.viewX += (x - this.viewWidthHalf ) / this.scale * addScale
			this.viewY += (y - this.viewHeightHalf) / this.scale * addScale
		}

		this._update()
	}
	setViewSize(width, height) {
		this.viewWidth = width
		this.viewHeight = height
		this._update()
	}
	
	_update() {
		if(0)
		console.log({
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			viewX: this.viewX,
			viewY: this.viewY,
		})
		
		while( 
			(
				( this.viewWidth  > this.frameBufferTexture.width  * this.scale ) ||
				( this.viewHeight > this.frameBufferTexture.height * this.scale ) 
			) &&
				this.scale < 1
		)
			this.scale += 0.1

		const viewMinX = -( this.frameBufferTexture.width  / 2 - this.viewWidthHalf  / this.scale )
		const viewMaxX = +( this.frameBufferTexture.width  / 2 - this.viewWidthHalf  / this.scale )
		const viewMinY = -( this.frameBufferTexture.height / 2 - this.viewHeightHalf / this.scale )
		const viewMaxY = +( this.frameBufferTexture.height / 2 - this.viewHeightHalf / this.scale )

		this.viewX = Math.max(viewMinX, Math.min(viewMaxX, this.viewX))
		this.viewY = Math.max(viewMinY, Math.min(viewMaxY, this.viewY))
		
		if ( this.viewWidth  > this.frameBufferTexture.width  * this.scale ) this.viewX = 0
		if ( this.viewHeight > this.frameBufferTexture.height * this.scale ) this.viewY = 0
	}
}

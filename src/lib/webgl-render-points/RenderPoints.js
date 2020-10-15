
import { WGL } from './helpers/webgl.js'
import { parseNormalizeColorHEX } from './helpers/utils.js'
import { DrawGrid } from './DrawGrid.js'
import { DrawPoints } from './DrawPoints.js'

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

		this.drawGrid = new DrawGrid(this.wgl, {
			gridColorHEX: '#CCCCCC50',
			gridCellWidth: 40,
			...this.options,
		})
		this.drawPoints = new DrawPoints(this.wgl)
		
		this.needReset = true

		this.addPoint = this.drawPoints.addPoint.bind( this.drawPoints )
		
		this.isDeleted = false
		const loop = () => 
			requestAnimationFrame(() => {
				if ( this.isDeleted )
					return
				
				loop()
				this.draw()
			}, this.canvas)
		loop()
	}
	
	reset() {
		this.needReset = true
		this.drawPoints.reset()
		
	}
	addPoint() {}

	draw() {
		const gl = this.wgl.gl
		if ( this.needReset ) {
			gl.clearColor( ...parseNormalizeColorHEX(this.options.backgroundColorHEX) )
			gl.disable(gl.DEPTH_TEST)
			gl.disable(gl.CULL_FACE)
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

			gl.enable( gl.BLEND )
			gl.blendEquation( gl.FUNC_ADD )
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA )
			
			this.drawGrid.draw()
			
			this.needReset = false
		}
		
		this.drawPoints.draw()
	}

	delete() {
		this.drawGrid.delete()
		this.drawPoints.delete()
		this.isDeleted = true
	}
}


import { precision } from './wglPrecision.js'
import { parseNormalizeColorHEX } from './helpers/utils.js'

export class DrawGrid {
	constructor(wgl, options) {
		this.wgl = wgl
		this.options = options
		
		this.program = this.wgl.createProgram( 
		`precision ${precision} float;

		attribute vec2  aPos;
		uniform vec2 uViewSize;

		void main(void) {
			gl_Position = vec4(aPos / (uViewSize / 2.0), 0,  1);
		}
		`, 
		`precision ${precision} float;
		uniform vec4 uColor;
		void main(void) {
			gl_FragColor = uColor;
		}`)
		
		this.make(this.wgl.viewWidth, this.wgl.viewHeight, options.gridCellWidth)	
	}
 
	make(W, H, cellWidth) {
		if ( this.glBuffer )
			this.glBuffer.delete()
		
		const xStep = cellWidth
		const yStep = cellWidth
		const vertexLines = []
		const make = (start, end, step, cb) => {
			let delta = Math.abs(end - start)
			const stepAbs = Math.abs(step)
			for(let i = start, j = 0; j <= delta; j += stepAbs, i += step)
				cb(i)
		}
		make(     0, H,  yStep, y => vertexLines.push(-W, y, W, y) )
		make(-yStep, H, -yStep, y => vertexLines.push(-W, y, W, y) )
		
		make(     0, W,  xStep, x => vertexLines.push(x, -H, x, H) )
		make(-xStep, W, -xStep, x => vertexLines.push(x, -H, x, H) )
		
		this.glBuffer = this.wgl.createBuffer()
		this.glBuffer.bindBuffer().bufferData( new Float32Array(vertexLines) )
		
		this.numLines = vertexLines.length / 2
	}
	
	draw() {
		const gl = this.wgl.gl
		
		gl.enable( gl.BLEND )
		gl.blendEquation( gl.FUNC_ADD )
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA )
		
		this.program.useProgram()
		this.program.enableVertexAttribArrayAll()
		
		this.glBuffer.bindBuffer()
		
		this.program.uColor.uniform4f( ...parseNormalizeColorHEX(this.options.gridColorHEX) )
		this.program.uViewSize.uniform2f(this.wgl.viewWidth, this.wgl.viewHeight)
		this.program.aPos.pointer({ size: 2 })
		
		gl.lineWidth(1)
		gl.drawArrays(gl.LINES, 0, this.numLines)
		
		this.program.disableVertexAttribArrayAll()
		
		gl.disable( gl.BLEND )
	}

	delete() {
		if ( this.glBuffer )
			this.glBuffer.delete()
	}
}

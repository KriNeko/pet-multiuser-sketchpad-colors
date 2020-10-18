
import { precision } from './wglPrecision.js'
import { parseNormalizeColorHEX } from './helpers/utils.js'

export class DrawTexture {
	constructor(wgl, options) {
		this.wgl = wgl
		this.options = options
		
		this.program = this.wgl.createProgram( 
		`precision ${precision} float;

		attribute vec2 aPos;

		uniform vec2 uViewSize;
		uniform vec4 uViewRect;
		uniform vec2 uScale;

		varying vec2 vUV;

		void main(void) {
			vUV = (aPos + vec2(1)) / vec2(2);
			
			vec2 rPos = uViewRect.xy;
			vec2 rSize = uViewRect.zw;
			
			vec2 pos = (vUV * uViewSize - rPos) / rSize;
			pos = pos * vec2(2) - vec2(1);
			pos *= uScale;
			
			gl_Position = vec4(pos, 0,  1);
			
			gl_Position[0] += uViewSize.x * uViewRect.x * 0.0;
			
			if ( uViewSize.x < 1000.0 )
				gl_Position[3] = 0.0;
		}
		`, 
		`precision ${precision} float;
		
		uniform sampler2D uTexture;
		varying vec2 vUV;
		
		void main(void) {
			gl_FragColor = texture2D(uTexture, vUV);
		}`)
		
		const pos = [
			[-1, +1], [+1, +1],
			[-1, -1],
			
					  [+1, +1],
					  [+1, -1],
			[-1, -1],
		].flat()
		
		this.glBuffer = this.wgl.createBuffer()
		this.glBuffer.bindBuffer().bufferData(new Float32Array([
				[-1, +1], [+1, +1],
				[-1, -1],
				
						  [+1, +1],
						  [+1, -1],
				[-1, -1],
			].flat()
		))
		console.log(pos)
	}

	drawTexture(glTexture, x, y, width, height, realWidth, realHeigh, zoom = 1) {
		const gl = this.wgl.gl
		
		this.program.useProgram()
		this.program.enableVertexAttribArrayAll()
		
		this.glBuffer.bindBuffer()
		this.program.aPos.pointer({ size: 2 })
		this.program.uViewSize.uniform2f(realWidth, realHeigh)
		this.program.uScale.uniform2f(zoom, zoom)
		
		//x = globalThis.x || 0
		//y = globalThis.y || 0
		this.program.uViewRect.uniform4f(x, y, width, height)
		
		//console.log({ width, height, realWidth, realHeigh })
		
		gl.bindTexture(gl.TEXTURE_2D, glTexture)
		gl.activeTexture(gl.TEXTURE0)
		this.program.uTexture.uniform1i(0)
		
		gl.drawArrays(gl.TRIANGLES, 0, 6)
		
		this.program.disableVertexAttribArrayAll()
	}

	delete() {
		if ( this.glBuffer )
			this.glBuffer.delete()
	}
}

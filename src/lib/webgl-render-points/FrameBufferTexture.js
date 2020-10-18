
export class FrameBufferTexture {
	constructor(wgl, options) {
		this.wgl = wgl
		const { gl } = this.wgl
		
		options = {
			width : 2048,
			height: 2048,
			
			...options
		}
		
		this.width  = Math.min( options.width , gl.getParameter(gl.MAX_TEXTURE_SIZE) )
		this.height = Math.min( options.height, gl.getParameter(gl.MAX_TEXTURE_SIZE) )
		
		const createTexture = () => {
			const level = 0
			const internalFormat = gl.RGBA
			const border = 0
			const format = gl.RGBA
			const type = gl.UNSIGNED_BYTE
			const data = null

			const glTextureRender = gl.createTexture()
			gl.bindTexture(gl.TEXTURE_2D, glTextureRender)
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, this.width, this.height, border, format, type, data)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			
			const ext = this.wgl.requestExtension('texture_filter_anisotropic', false)
			if ( ext ) {
				const max = gl.getParameter( ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT )
				gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max)
			}
			
			return glTextureRender
		}
		
		this.glTextureRender = createTexture()
		this.glFrameBuffer = gl.createFramebuffer()
		
		this.viewportSettingsStack = []
	}

	begin() {
		const { gl } = this.wgl
		
		this.viewportSettingsStack.push([ this.wgl.viewWidth, this.wgl.viewHeight ])
		this.wgl.viewport(this.width, this.height)

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFrameBuffer)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glTextureRender, 0)
	}
	end() {
		const { gl } = this.wgl
		 
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		this.wgl.viewport(...this.viewportSettingsStack.pop())
	}
}  


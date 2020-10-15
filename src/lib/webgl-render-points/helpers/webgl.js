
export class WGLAttribute {
	constructor(gl, name, type, size, location) {
		this.gl = gl
		this.name = name
		this.type = type
		this.size = size
		this.location = location
	}
	enable() {
		this.gl.enableVertexAttribArray( this.location )
	}
	pointer({ size, type, normalized, stride, offset}) {
		this.gl.vertexAttribPointer(
			this.location, 
			size, 
			type || this.gl.FLOAT, 
			normalized || false,
			stride || 0,
			offset || 0
		)
	}
}
export class WGLUniform {
	constructor(gl, name, type, size, location) {
		this.gl = gl
		this.name = name
		this.type = type
		this.size = size
		this.location = location
	}

	uniform1f(...args) { this.gl.uniform1f(this.location, ...args) }
	uniform2f(...args) { this.gl.uniform2f(this.location, ...args) }
	uniform3f(...args) { this.gl.uniform3f(this.location, ...args) }
	uniform4f(...args) { this.gl.uniform4f(this.location, ...args) }
	
	uniformMatrix2fv(data, transpose = false) { this.gl.uniformMatrix2fv(this.location, transpose, data) }
	uniformMatrix3fv(data, transpose = false) { this.gl.uniformMatrix3fv(this.location, transpose, data) }
	uniformMatrix4fv(data, transpose = false) { this.gl.uniformMatrix4fv(this.location, transpose, data) }
}
export class WGLProgram {
	constructor(gl, vsSource, fsSource) {
		this.gl = gl
		this.glProgram = null
		this.inParams = {}

		const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource)
		const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource)

		this.glProgram = this.gl.createProgram()
		this.gl.attachShader(this.glProgram, vertexShader)
		this.gl.attachShader(this.glProgram, fragmentShader)
		this.gl.linkProgram(this.glProgram)
		
		if ( !this.gl.getProgramParameter(this.glProgram, this.gl.LINK_STATUS) ) {
			const errorText = 'Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.glProgram)
			console.error(errorText)
			this.gl.deleteProgram(this.glProgram)
			throw new Error( errorText )
		}

		const parseInParams = (propNum, getActiveFn, getLocationFn, addEnableFn = false) => {
			const num = this.gl.getProgramParameter(this.glProgram, propNum)
			const locations = []
			for(let i = 0; i < num; i++) {
				const _info = getActiveFn(this.glProgram, i)
				const location = getLocationFn(this.glProgram, _info.name)
				const info = {
					name: _info.name,
					type: _info.type,
					size: _info.size,
					location
				}
				this.inParams[ info.name ] = info
				this[ info.name ] = location
				if ( addEnableFn ) {
					this[ info.name ] = new WGLAttribute(this.gl, info.name, info.type, info.size, location)
					locations.push(location)
				} else {
					this[ info.name ] = new WGLUniform(this.gl, info.name, info.type, info.size, location)
				}
			}
			if ( addEnableFn ) {
				this.enableVertexAttribArrayAll = () => 
					locations.map( location => this.gl.enableVertexAttribArray( location ) )
				this.disableVertexAttribArrayAll = () =>
					locations.map( location => this.gl.disableVertexAttribArray( location ) )	
			} 
		}

		parseInParams( this.gl.ACTIVE_ATTRIBUTES, this.gl.getActiveAttrib.bind(this.gl) , this.gl.getAttribLocation.bind(this.gl), true )
		parseInParams( this.gl.ACTIVE_UNIFORMS  , this.gl.getActiveUniform.bind(this.gl), this.gl.getUniformLocation.bind(this.gl) )
	}
	loadShader(type, source) {
		const gl = this.gl
		
		const shader = gl.createShader(type)
		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
			const errorText = 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)
			console.error(errorText)
			gl.deleteShader(shader)
			throw new Error( errorText )
		}

		return shader
	}
	useProgram() {
		this.gl.useProgram( this.glProgram )
	}
}
export class WGLBuffer {
	constructor(gl, target = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW) {
		this.gl = gl
		this.target = target
		this.usage = usage

		this.glBuffer = gl.createBuffer()
		this.isDeleted = false
	}
	bindBuffer() {
		this.gl.bindBuffer(this.target, this.glBuffer)
		return this
	}
	bufferData(data, usage = this.usage) {
		this.usage = usage
		this.gl.bufferData(this.target, data, usage)
		return this
	}
	bufferSubData(data, offset = 0) {
		this.gl.bufferSubData(this.target, offset, data)
		return this
	}
	delete() {
		this.gl.deleteBuffer(this.glBuffer)
		this.isDeleted = true
	}
}
export class WGL {
	constructor(canvas, options) {
		['webgl', 'experimental-webgl'].some(name =>
			this.gl = canvas.getContext(name, {
				alpha: false,
				depth: false,
				stencil: false,
				antialias: false,
				premultipliedAlpha: false,
				preserveDrawingBuffer: true,
				//failIfMajorPerformanceCaveat: true,
				
				...options
			}) 
		)
		if ( !this.gl )
			throw new Error(`WEBGL not supported`)
		
		this.viewWidth  = options.viewWidth
		this.viewHeight = options.viewHeight
		
		this.gl.viewport(0, 0, this.viewWidth, this.viewHeight)

		this.supportedExtensions = this.gl.getSupportedExtensions()
		this.extensions = {}
	}

	requestExtension(pattern, throwError = true) {
		const ext = this.extensions[pattern]
		if ( ext )
			return ext
		
		const name = this.supportedExtensions.find(v => v.toLowerCase().indexOf( pattern.toLowerCase() ) >= 0 )
		if ( !name ) {
			if ( throwError )
				throw new Error(`WEBGL Extension ${pattern} not found`)
			return null
		}

		return this.extensions[pattern] = this.gl.getExtension(name)
	}

	createProgram(vsSource, fsSource) {
		return new WGLProgram(this.gl, vsSource, fsSource)
	}
	createBuffer(target = this.gl.ARRAY_BUFFER, usage = this.gl.STATIC_DRAW) {
		return new WGLBuffer(this.gl, target, usage)
	}

	
}

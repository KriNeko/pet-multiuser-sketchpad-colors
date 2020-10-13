const supportResizeObserver = typeof ResizeObserver !== 'undefined'

export const resizeObserver = (elem, callback) => {
	const interval = 100
	if ( supportResizeObserver ) {
		const resizeObserver = new ResizeObserver(callback)
		resizeObserver.observe(elem)
		return { destroy: () => resizeObserver.disconnect() }
	}
	
	const keys = [ "x", "y", "height", "width", ]
	let prevBBox = {}
	const loop = () => () => {
		const nextBBox = elem.getBoundingClientRect()
		if ( keys.some(k => prevBBox[k] !== nextBBox[k]) )
			callback()
			
		prevBBox = nextBBox
	}
	loop()

	const iiId = setInterval(loop, interval)
	return { destroy: () => clearInterval(iiId) }
}

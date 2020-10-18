let supportResizeObserver = typeof ResizeObserver !== 'undefined'

const resizeListeners = new Set()
window.addEventListener('resize', () => {
	for(const cb of resizeListeners.values())
		cb()
})

export const useResizeObserver = (elem, callback) => {
	const interval = 100
	if ( supportResizeObserver ) {
		const resizeObserver = new ResizeObserver((a) => callback(a?.[0]?.contentRect))
		resizeObserver.observe(elem)
		return { destroy: () => resizeObserver.disconnect() }
	}
	
	const keys = [ "x", "y", "height", "width", ]
	let prevBBox = {}
	const loop = () => {
		const nextBBox = elem.getBoundingClientRect()
		if ( keys.some(k => prevBBox[k] !== nextBBox[k]) )
			callback(nextBBox)
			
		prevBBox = nextBBox
	}
	loop()

	resizeListeners.add(loop)

	const iiId = setInterval(loop, interval)
	return {
		destroy() {
			clearInterval(iiId)
			resizeListeners.delete(loop)
		}
	}
}


export const setIntervalSvelte = onDestroy => {
	const set = new Set()
	onDestroy(() => {
		for(const tid of set.values()) {
			clearInterval(tid[0])
			tid[0] = null
		}
		set.clear()
	})
	return msec => cb => {
		const tid = [setInterval(cb, msec)]
		set.add(tid)
	
		return () => {
			if ( tid[0] === null )
				return
			
			clearInterval(tid[0])
			tid[0] = null
			set.delete(tid)
		}
	}
}
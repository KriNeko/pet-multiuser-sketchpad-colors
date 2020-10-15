
export const setTimeoutSvelte = onDestroy => {
	const set = new Set()
	onDestroy(() => {
		for(const tid of set.values())
			clearTimeout(tid)
	})
	return msec => cb => {
		let tid = setTimeout(() => {
			set.delete(tid)
			tid = null
			cb()
		}, msec)
		set.add(tid)
	
		return () => {
			if ( tid === null )
				return
			
			clearTimeout(tid)
			set.delete(tid)
			tid = null
		}
	}
}
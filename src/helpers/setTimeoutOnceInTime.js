
export const setTimeoutOnceInTime = onDestroy => {
	let tid = null
	const cancel = () => (tid !== null) && (clearTimeout(tid), tid = null)
	onDestroy(cancel)
	return msec => cb => {
		cancel()
		tid = setTimeout(() => {
			tid = null
			cb()
		}, msec)
	}
}
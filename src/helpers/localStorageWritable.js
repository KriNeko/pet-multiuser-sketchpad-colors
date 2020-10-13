
import { writable } from 'svelte/store'

const getKey = name => {
	return '_ls_wr_store_b9i8scz65v' + (name)
}
const map = {}
export const localStorageWritable = (name, initValue) => {
	const key = getKey(name)
	if ( map[key] )
		return map[key]
	
	try {
		initValue = JSON.parse( localStorage[key] )
	} catch {}
	
	const w = map[key] = writable(initValue)
	w.subscribe(v => {
		try {
			localStorage[key] = JSON.stringify( v )
		} catch {}
	})
	return w
}
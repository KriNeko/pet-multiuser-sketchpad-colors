
import { get, writable } from 'svelte/store'
import { localStorageWritable } from '@/helpers/localStorageWritable.js'
import { rpc } from '@/control/net.js'



let _userMap = {}
export const userMap = writable(_userMap)

const setEntry = entry => _userMap[entry.id] = entry

rpc.subscribe('userList', list => {
	_userMap = {}
	list.map(setEntry)
	userMap.set(_userMap)
})
rpc.subscribe('user', entry => {
	setEntry(entry)
	userMap.set(_userMap)
})

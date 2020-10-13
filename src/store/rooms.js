
import { writable, get } from 'svelte/store'
import { localStorageWritable } from '@/helpers/localStorageWritable.js'
import { rpc } from '@/control/net.js'

export const currentRoom = localStorageWritable('rooms/currentRoom', null)

export const roomActive = writable(null)
export const roomReady = writable(false)

let _roomMap = {}
export const roomMap = writable(_roomMap)

const setEntry = entry => _roomMap[entry.id] = entry

rpc.subscribe('roomList', list => {
	_roomMap = {}
	list.map(setEntry)
	roomMap.set(_roomMap)
})
rpc.subscribe('room', entry => {
	setEntry(entry)
	roomMap.set(_roomMap)
})


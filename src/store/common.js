
import { get, writable } from 'svelte/store'

import { id as selfUserID } from '@/store/auth.js'
import { roomMap } from '@/store/rooms.js'
import { userMap } from '@/store/users.js'
import { isAuthorized } from '@/store/auth.js'

export const selfRoomActive = writable(null)
export const users = writable([])
export const rooms = writable([])

function watch() {
	const _selfUserID = get(selfUserID)
	
	const _roomMap = get(roomMap)
	const _userMap = get(userMap)

	const _rooms = Object.values(_roomMap)
	const _users = Object.values(_userMap)

	let _selfRoomActive = _roomMap?.[ _userMap?.[_selfUserID]?.roomID ]
	_rooms.map(r => {
		r.numUsers = 0
		r.numUsersOnline = 0
	})

	_users.map(u => {
		const room = _roomMap[ u.roomID ]
		if ( room ) {
			room.numUsers++
			//if ( u.isOnline )
				room.numUsersOnline++
		}
	})
	
	;[..._rooms]
		.sort((l, r) => {
			const d = r.numUsersOnline - l.numUsersOnline
			if ( d )
				return d
			
			return r.timeCreate - l.timeCreate
		})
		.map((r, i, a) => {
			r.order = i
			r.zIndex = a.length - i
		})
	
	selfRoomActive.set(_selfRoomActive)
	users.set( _users )
	rooms.set( _rooms )
}
roomMap.subscribe(watch)
userMap.subscribe(watch)


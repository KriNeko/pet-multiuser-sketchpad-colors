import Storage from './components/storage.js';

const sendBroadcast = (data, room, withoutUser) => {
	for(const client of Storage.getInstance().clients)
		if ( ( !room || client.room === room ) && client !== withoutUser )
			client.send(data)
}
export const sendBroadcastJSON = (data, room, withoutUser) => sendBroadcast(JSON.stringify(data), room, withoutUser)

export const validUserLogin = login => /^[a-z0-9_]{1,14}$/.test(login)
export const validRoomName = validUserLogin

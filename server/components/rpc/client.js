import RPCClientBase from './base.js';

export default class Client extends RPCClientBase {
	constructor(webSocket, user, session) {
		super(webSocket)

		this.user = user
		this.session = session
		this.room = null
		
		this.user.client = this

		this.isOnline = false

		clients.push(this)

		this.sendBroadcastJSON('userList', clients.map(c => c.toSendFormat()) )
		this.sendBroadcastJSON('roomList', [...rooms.values()].map(c => c.toSendFormat()) )
		
		this.webSocket.on('close', () => this.destroy())
	}

	toSendFormat() {
		return {
			id: this.user.id,
			timeCreate: this.user.timeCreate,
			login: this.user.login,
			
			roomID  : this.room?.id,
			isOnline: this.isOnline,
		}
	}
	sendBroadcastJSON(action, data) {
		sendBroadcastJSON({ action, data })		
	}
	sendBroadcastThisUser() {
		this.sendBroadcastJSON('user', this.toSendFormat())
	}

	actionUserSetOnlineStatus(obj) {
		this.isOnline = obj.isOnline
		this.sendBroadcastThisUser()
		return Result.success(true)
	}

	actionRoomCreate(obj) {
		const result = rooms.actionRoomCreate(obj)
		
		const room = rooms.get(result.result.roomName)
		this.sendBroadcastJSON('room', room.toSendFormat())
		
		return result
	}
	actionRoomConnect(obj) {
		const room = rooms.getRoom(obj)

		this.actionRoomDisconnect()

		this.room = room
		this.room.clients.add(this)
		
		this.penWriterReadOffset = 0
		this.sendPenWriterData()
		
		this.sendBroadcastThisUser()
		
		return Result.success(room.toSendFormat())
	}
	actionRoomDisconnect() {
		if ( !this.room )
			return Result.success(false)

		this.room.clients.delete(this)
		this.room = null
		
		this.sendBroadcastThisUser()
		
		return Result.success(true)
	}

	sendPenWriterData() {
		const data = this.room.penWriter.readData(this.penWriterReadOffset)
		this.penWriterReadOffset += data.length
		this.send(data)
	}

	destroy() {
		this.isOnline = false
		this.actionRoomDisconnect()
		this.sendBroadcastThisUser()
		
		clients.splice(clients.indexOf(this), 1)
		this.user.client = null	
		this.webSocket.close()
	}
	
	parseBinary(data) {
		if ( !this.room )
			return
		
		this.room.analysisRecvData(this.user.id, data)
	
		for(const client of this.room.clients.values()) {
			if ( client === this ) continue
			client.sendPenWriterData()
		}
	}
}

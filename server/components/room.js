export default class Room {
	constructor(roomName, userCreator) {
		this.id = roomNextID++
		this.timeCreate = Date.now()
		this.roomName = roomName
		this.userCreator = userCreator

		this.users = new Set([])
		this.usersOnline = new Set()
		this.clients = new Set()
		
		this.buffer = Buffer.alloc(0)

		this.penWriter = new PenWriter(1024*1024)
	}

	analysisRecvData(userID, data) {
		if ( !this.penWriter.canWrite() )
			return
		
		this.penWriter.analysisRecvData(userID, data)
		//console.log( this.penWriter.bufferWriter.writeOffset )
	}
	
	toSendFormat() {
		return {
			id: this.id,
			timeCreate: this.timeCreate, 
			roomName: this.roomName, 
			numUsers: this.users.size,
			numUsersOnline: this.usersOnline.size
		}
	}

	sendPenWriterData() {
		const data = this.penWriter.readData(this.penWriterReadOffset)
		this.penWriterReadOffset += data.length
		this.send(data)
	}

	sendBroadcast(data, withoutClient) {
		for(const client of this.clients.values())
			if ( client !== withoutClient )
				client.send(data)
	}
	sendBroadcastJSON(data, withoutClient) {
		this.sendBroadcast( JSON.stringify(data) )
	}
}

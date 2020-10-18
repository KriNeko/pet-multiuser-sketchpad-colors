import Result from './result.js';
import Room from './room.js';
import {
	ERROR_INVALID_INPUT_DATA,
	ERROR_ESSENCE_ALREADY_EXISTS,
	ERROR_ESSENCE_NOT_FOUND
} from '../contstants.js';

export default class Rooms extends Map {
	parseRoomName(obj) {
		const roomName = String(obj?.roomName)
		if ( !validRoomName(roomName) )
			throw Result.error(ERROR_INVALID_INPUT_DATA)
		
		return { roomName }
	}

	actionRoomCreate(obj, client, user) {
		const { roomName } = this.parseRoomName(obj)

		if ( this.has(roomName) )
			throw Result.error(ERROR_ESSENCE_ALREADY_EXISTS)
		
		const room = new Room(roomName, user)
		this.set(roomName, room)

		return Result.success(room.toSendFormat())
	}

	getRoom(obj) {
		const { roomName } = this.parseRoomName(obj)
		
		const room = this.get(roomName)
		if ( !room )
			throw Result.error(ERROR_ESSENCE_NOT_FOUND)
		
		return room
	}
}
import {
	
	CL_PEN_DOWN,
	CL_PEN_UP,
	CL_PEN_MOVE,
	CL_PEN_SET_LINE_WIDTH,
	CL_PEN_SET_COLOR,
	
	SV_SUBCMD_EX,
	SV_SUBCMD_EX_PUSH_USER_ID, 
	SV_SUBCMD_EX_SET_USER_COLOR,
	SV_SUBCMD_EX_SET_USER_LINE_WIDTH,

	SV_SUBCMD_PUSH_USER_INDEX,

	SV_SUBCMD_PEN_DOWN_SMALL,
	SV_SUBCMD_PEN_DOWN_MIDDLE,
	SV_SUBCMD_PEN_DOWN_LARGE, 

	SV_SUBCMD_PEN_MOVE_SMALL, 
	SV_SUBCMD_PEN_MOVE_MIDDLE,
	SV_SUBCMD_PEN_MOVE_LARGE
	
} from './PenConstants.js'

import { BufferWriter, BufferReader, BitWriter, BitReader } from './BufferWR.js'
import { arraySwap } from './utils.js'

/**
0 - userIndex 0, penMove [4bit for x, 3 bit for y]
1	[3bit - cmd] 
	cmd = 0 - ex 
		[4bit - ex cmd]
		exCmd = 0 [4bytes] - push user id
	
	cmd = 1 [4bits] - push user index([1, 16])
	
	cmd = 2 [1bytes(6bit for x, 6bit for y)] - penShortDown
	cmd = 3 [2bytes(10bit for x, 10bit for y)] - penDown
	cmd = 4 [3bytes(14bit for x, 14bit for y)] - penLongDown

	cmd = 5 [1bytes] - penShortMove
	cmd = 6 [2bytes] - penMove
	cmd = 7 [3bytes] - penLongMove
	
1	1	0 [5bit noop] [4bytes] - pushUserID
1	1	1	0 [6bit for x, 6bit for y] - penShortDown
1	1	1	1	0
*/

export class PenWriter {
	constructor(size = 1024*1024) {
		this.userIDList = []
		this.userIDMap = {}
		
		this.numMessages = 0
		this.bufferWriter = new BufferWriter(size)
		this.bitWriter = new BitWriter()
	}

	readData(offset) {
		return this.bufferWriter.buffer.slice(offset, this.bufferWriter.writeOffset)
	}
	
	getUser(userID) {
		let user = this.userIDMap[userID]
		if ( !user )
			user = this.userIDMap[userID] = { x: 0, y: 0 }
		return user
	}

	pushUserIDToTop(userID) {
		const writeSVPushUserID = userID => {
			const bw = new BitWriter()
			bw.writeBit(1)
			bw.writeBits(SV_SUBCMD_EX, 3)
			bw.writeBits(SV_SUBCMD_EX_PUSH_USER_ID, 3)
			this.bufferWriter.writeU8(bw.value)
			this.bufferWriter.writeU32(userID)
			this.numMessages++
		}
		const writeSVPushUserIndex = index => {
			const bw = new BitWriter()
			bw.writeBit(1)
			bw.writeBits(SV_SUBCMD_PUSH_USER_INDEX, 3)
			bw.writeBits(index - 1, 4)
			this.bufferWriter.writeU8(bw.value)
			this.numMessages++
		}

		const index = this.userIDList.indexOf(userID)
		if ( index === 0 )
			return
		
		if ( index < 0 ) {
			this.userIDList.unshift(userID)
			writeSVPushUserID(userID)
			return
		}
		
		arraySwap(this.userIDList, 0, index)
		if ( index >= 1 && index <= 16 ) {
			writeSVPushUserIndex(index)
			return
		}

		writeSVPushUserID(userID)
	}

	writePenDelta(userID, xAbs, yAbs, isMove, cmdSmall, cmdMiddle, cmdLarge) {
		let user = this.getUser(userID)
		const x = xAbs - user.x
		const y = yAbs - user.y
		user.x = xAbs
		user.y = yAbs
		
		const bw = new BitWriter()
		if ( 
			isMove &&
			x >= -8 && x <= 7 && 
			y >= -4 && y <= 3 ) {
			
			bw.writeBit(0)
			bw.writeBits(x + 8, 4)
			bw.writeBits(y + 4, 3)
			this.bufferWriter.writeU8(bw.value)
			this.numMessages++
		} else if ( 
			x >= -32 && x <= 31 && 
			y >= -32 && y <= 31 ) {
			
			bw.writeBit(1)
			bw.writeBits(cmdSmall, 3)
			bw.writeBits(x + 32, 6)
			bw.writeBits(y + 32, 6)
			this.bufferWriter.writeU16(bw.value)
			this.numMessages++
		} else if (
			x >= -512 && x <= 511 && 
			y >= -512 && y <= 511 ) {

			bw.writeBit(1)
			bw.writeBits(cmdMiddle, 3)
			bw.writeBits(x + 512, 10)
			bw.writeBits(y + 512, 10)
			this.bufferWriter.writeU24(bw.value)
			this.numMessages++
		} else if ( 
			x >= -8192 && x <= 8191 && 
			y >= -8192 && y <= 8191 ) {

			bw.writeBit(1)
			bw.writeBits(cmdLarge, 3)
			bw.writeBits(xAbs + 8192, 14)
			bw.writeBits(yAbs + 8192, 14)
			this.bufferWriter.writeI32(bw.value)
			this.numMessages++
		}
	}

	penDown(userID, x, y) {
		this.pushUserIDToTop(userID)
		this.writePenDelta(userID, x, y, false, SV_SUBCMD_PEN_DOWN_SMALL, SV_SUBCMD_PEN_DOWN_MIDDLE, SV_SUBCMD_PEN_DOWN_LARGE)
	}
	penMove(userID, x, y) {
		this.pushUserIDToTop(userID)
		this.writePenDelta(userID, x, y, true, SV_SUBCMD_PEN_MOVE_SMALL, SV_SUBCMD_PEN_MOVE_MIDDLE, SV_SUBCMD_PEN_MOVE_LARGE)
	}
	penUp(userID) {
		console.log('penUp', userID)
	}
	penSetColor(userID, r, g, b, a) {
		console.log('penSetColor', {userID, r, g, b, a})
		
		this.pushUserIDToTop(userID)
		
		const bw = new BitWriter()
		bw.writeBit(1)
		bw.writeBits(SV_SUBCMD_EX, 3)
		bw.writeBits(SV_SUBCMD_EX_SET_USER_COLOR, 3)
		this.bufferWriter.writeU8(bw.value)
		this.bufferWriter.writeU8(r)
		this.bufferWriter.writeU8(g)
		this.bufferWriter.writeU8(b)
		this.bufferWriter.writeU8(a)
		this.numMessages++
	}
	penSetLineWidth(userID, lineWidth) {
		console.log('penSetLineWidth', {userID, lineWidth})
		
		this.pushUserIDToTop(userID)
		
		const bw = new BitWriter()
		bw.writeBit(1)
		bw.writeBits(SV_SUBCMD_EX, 3)
		bw.writeBits(SV_SUBCMD_EX_SET_USER_LINE_WIDTH, 3)
		this.bufferWriter.writeU8(bw.value)
		this.bufferWriter.writeU16(lineWidth)
		this.numMessages++
	}

	analysisRecvData(userID, data) {
		if ( !data.length )
			return
		const cmd = data[0]
		switch( cmd ) {
			case CL_PEN_DOWN:
			case CL_PEN_MOVE:
				if ( data.length !== 5 )
					return
				
				const x = data.readInt16LE(1)
				const y = data.readInt16LE(3)
				if ( cmd === CL_PEN_DOWN )
					this.penDown(userID, x, y)
				else
					this.penMove(userID, x, y)
				break
			
			case CL_PEN_UP:
				this.penUp(userID)
				break
			
			case CL_PEN_SET_LINE_WIDTH:
				if ( data.length !== 3 )
					return
				
				this.penSetLineWidth(userID, data.readUInt16LE(1))
				break
				
			case CL_PEN_SET_COLOR:
				if ( data.length !== 5 )
					return
				
				this.penSetColor(userID, data[1], data[2], data[3], data[4], data[5])
				break
				
		}
	}

	canWrite() {
		return this.bufferWriter.writeOffset + 32 < this.bufferWriter.buffer.length
	}
}

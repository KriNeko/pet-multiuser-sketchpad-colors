
import {
	
	CL_PEN_DOWN,
	CL_PEN_UP,
	CL_PEN_MOVE,
	
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

export class PenReader {
	constructor() {
		this.userIDList = []
		this.userIDMap = {}	
	}
	
	pushUserIDToTop(userID) {
		this.userIDMap[userID] = this.userIDMap[userID] || { 
			x: 0, y: 0,
			color: [0,0,0,0],
			lineWidth: 1,
		}

		const index = this.userIDList.indexOf(userID)
		if ( ~index ) {
			arraySwap(this.userIDList, 0, index)
			return
		}
		
		this.userIDList.unshift(userID)
	}
	pushUserIndexToTop(index) {
		arraySwap(this.userIDList, 0, index)
	}
	
	penDown(userID, x, y) {
		console.log('penDown', userID, '->', x, y)
	}
	penMove(userID, x0, y0, x, y) {
		console.log('penMove', userID, x0, y0, '->', x, y)
	}
	
	_parseCoords(isDownCmd, x, y, isDelta = true) {
		const userID = this.userIDList[0]
		const user = this.userIDMap[ userID ]
		if ( isDelta ) {
			x += user.x
			y += user.y
		}
		const x0 = user.x
		const y0 = user.y
		user.x = x
		user.y = y
		if ( isDownCmd )
			this.penDown(userID, x, y, user.color[0], user.color[1], user.color[2], user.color[3], user.lineWidth)
		else
			this.penMove(userID, x0, y0, x, y, user.color[0], user.color[1], user.color[2], user.color[3], user.lineWidth)
	}
	parseCoords(bufferReader, bitReader, subCmd) {
		const isDownCmd = subCmd <= SV_SUBCMD_PEN_DOWN_LARGE
		switch( subCmd ) {
			case SV_SUBCMD_PEN_DOWN_SMALL:
			case SV_SUBCMD_PEN_MOVE_SMALL:
				bitReader.reset( bufferReader.readU16() )
				bitReader.readBits(4)
				this._parseCoords( isDownCmd, bitReader.readBits(6) - 32, bitReader.readBits(6) - 32 )
				break
				
			case SV_SUBCMD_PEN_DOWN_MIDDLE:
			case SV_SUBCMD_PEN_MOVE_MIDDLE:
				bitReader.reset( bufferReader.readU24() )
				bitReader.readBits(4)
				this._parseCoords( isDownCmd, bitReader.readBits(10) - 512, bitReader.readBits(10) - 512 )
				break
				
			case SV_SUBCMD_PEN_DOWN_LARGE:
			case SV_SUBCMD_PEN_MOVE_LARGE:
				bitReader.reset( bufferReader.readI32() )
				bitReader.readBits(4)
				this._parseCoords( isDownCmd, bitReader.readBits(14) - 8192, bitReader.readBits(14) - 8192, false )
				break
		}
	}
	parseBuffer(bufferReader) {
		const bitReader = new BitReader()
		const firstByte = bufferReader.readU8(false)
		
		bitReader.reset(firstByte)
		
		const bitType = bitReader.readBit()
		if ( !bitType ) {
			bufferReader.readU8()
			this._parseCoords(false, bitReader.readBits(4) - 8, bitReader.readBits(3) - 4)
		} else {
			const subCmd = bitReader.readBits(3)
			const subCmdEx = bitReader.readBits(4)
			
			switch( subCmd ) {
				case SV_SUBCMD_EX:
					bufferReader.readU8()
					
					switch( subCmdEx ) {
						case SV_SUBCMD_EX_PUSH_USER_ID:
							const userID = bufferReader.readI32()
							this.pushUserIDToTop(userID)
							break
						
						case SV_SUBCMD_EX_SET_USER_COLOR:
							this.userIDMap[ this.userIDList[0] ].color = [bufferReader.readU8(), bufferReader.readU8(), bufferReader.readU8(), bufferReader.readU8()]
							break
						
						case SV_SUBCMD_EX_SET_USER_LINE_WIDTH:
							this.userIDMap[ this.userIDList[0] ].lineWidth = bufferReader.readU16()
							break
					}
				
					break
				
				case SV_SUBCMD_PUSH_USER_INDEX:
					bufferReader.readU8()
					const index = subCmdEx + 1
					this.pushUserIndexToTop(index)
					break
				
				default:
					this.parseCoords(bufferReader, bitReader, subCmd)
			}
			
		}
			
	}
	
	addBuffer(ab, count = 1e9) {
		const bufferReader = new BufferReader(ab)
		while(count-- && bufferReader.readOffset < ab.byteLength)
			this.parseBuffer(bufferReader)
	}

	reset() {
		this.userIDList = []
		this.userIDMap = {}
	}
}

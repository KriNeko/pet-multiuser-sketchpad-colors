import {
	
	CL_PEN_DOWN,
	CL_PEN_UP,
	CL_PEN_MOVE,
	CL_PEN_SET_LINE_WIDTH,
	CL_PEN_SET_COLOR
	
} from './PenConstants.js'

import { BufferWriter, BufferReader, BitWriter, BitReader } from './BufferWR.js'
import { arraySwap } from './utils.js'

const dv1byte = new DataView(new ArrayBuffer(1))
const dv5byte = new DataView(new ArrayBuffer(5))
const dv3byte = new DataView(new ArrayBuffer(3))

export class PenWriterClient {
	sendBinary() {}
	
	_writeBSS(byte, short0, short1) {
		dv5byte.setUint8(0, byte , true)
		dv5byte.setInt16(1, short0, true)
		dv5byte.setInt16(3, short1, true)	
		this.sendBinary(dv5byte)
	}
	penDown(x ,y) {
		this._writeBSS(CL_PEN_DOWN, x, y)
	}
	penUp() {
		dv1byte.setUint8(0, CL_PEN_UP, true)
		this.sendBinary(dv1byte)
	}
	penMove(x ,y) {
		this._writeBSS(CL_PEN_MOVE, x, y)
	}
	penSetLineWidth(lineWidth) {
		dv3byte.setUint8(0, CL_PEN_SET_LINE_WIDTH, true)
		dv3byte.setUint16(1, lineWidth, true)
		this.sendBinary(dv3byte)
	}
	penSetColor(r, g, b, a) {
		dv5byte.setUint8(0, CL_PEN_SET_COLOR, true)
		dv5byte.setUint8(1, r, true)
		dv5byte.setUint8(2, g, true)
		dv5byte.setUint8(3, b, true)
		dv5byte.setUint8(4, a, true)
		this.sendBinary(dv5byte)
	}
}

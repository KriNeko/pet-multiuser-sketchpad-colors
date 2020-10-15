
export class BufferWriter {
	constructor(size = 1024*1024) {
		this.writeOffset = 0
		this.buffer = Buffer.alloc(size)
	}

	writeU8(val) {
		this.buffer[ this.writeOffset++ ] = val
	}
	writeU16(val) {
		this.buffer.writeUInt16LE(val, this.writeOffset)
		this.writeOffset += 2
		return this
	}
	writeU24(val) {
		this.writeU8(val)
		this.writeU16(val >> 8)
		return this
	}
	writeU32(val) {
		this.buffer.writeUInt32LE(val, this.writeOffset)
		this.writeOffset += 4
		return this
	}
	
	writeI16(val) {
		this.buffer.writeInt16LE(val, this.writeOffset)
		this.writeOffset += 2
		return this
	}
	writeI32(val) {
		this.buffer.writeInt32LE(val, this.writeOffset)
		this.writeOffset += 4
		return this
	}
}
export class BufferReader {
	constructor(ab) {
		this.readOffset = 0
		this.dataView = new DataView(ab)
	}
	
	readU8(shift = true) {
		const ret = this.dataView.getUint8(this.readOffset, true)
		if ( shift )
			this.readOffset += 1
		return ret
	}
	readU16(shift = true) {
		const ret = this.dataView.getUint16(this.readOffset, true)
		if ( shift )
			this.readOffset += 2
		return ret
	}
	readU24(shift = true) {
		const u8 = this.dataView.getUint8(this.readOffset + 0, true)
		const u16 = this.dataView.getUint16(this.readOffset + 1, true)		
		if ( shift )
			this.readOffset += 3
		return u8 | (u16 << 8)
	}
	readI32(shift = true) {
		const ret = this.dataView.getInt32(this.readOffset, true)
		if ( shift )
			this.readOffset += 4
		return ret
	}
}
export class BitWriter {
	constructor() {
		this.value = 0
		this.bitOffset = 0
	}
	reset() {
		this.value = 0
		return this
	}
	writeBit(bit = 1) {
		this.value |= (bit << this.bitOffset++)
		return this
	}
	writeBits(val, numBits) {
		this.value |= val << this.bitOffset
		this.bitOffset += numBits
		return this
	}
}
export class BitReader {
	constructor(value = 0) {
		this.value = value
		this.bitOffset = 0
	}
	reset(value = 0) {
		this.value = value
		this.bitOffset = 0
	}
	readBit() {
		return ( this.value >>> this.bitOffset++ ) & 1
	}
	readBits(numBits) {
		const ret = ( this.value >>> this.bitOffset ) & ( (1 << numBits) - 1 )
		this.bitOffset += numBits
		return ret
	}
}


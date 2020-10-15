
import { RenderPoints } from './RenderPoints.js'

const canvas = document.querySelector('#canvas')

const W = 800, H = 800
canvas.width  = W
canvas.height = H
canvas.style.width  = W+'px'
canvas.style.height = H+'px'
const renderPoints = new RenderPoints(canvas, {
	viewWidth: W,
	viewHeight: H,
})

class BufferWriter {
	constructor() {
		this.ab = new ArrayBuffer(1024*1024)
		this.writeOffset = 0
		this.dataView = new DataView(this.ab)
		this.littleEndian = true
	}

	i8(val, littleEndian = this.littleEndian) {
		this.dataView.setInt8(this.writeOffset, val, littleEndian)
		this.writeOffset += 1
		return this
	}
	i16(val, littleEndian = this.littleEndian) {
		this.dataView.setInt16(this.writeOffset, val, littleEndian)
		this.writeOffset += 2
		return this
	}
	i32(val, littleEndian = this.littleEndian) {
		this.dataView.setInt32(this.writeOffset, val, littleEndian)
		this.writeOffset += 4
		return this
	}
}

/**
CMD_DOWN
CMD_UP
CMD_MOVE

CMD_SETTINGS

*/
const bw = new BufferWriter()
function writeData(x, y, r, g, b, a, pointWidth) {
	bw
		.i8(1)	/// cmd
		.i32(1)	/// userID
		.i32(x)
		.i32(y)
}

let pressed = false
canvas.addEventListener('mousedown', e => {
	const x = e.offsetX - W/2
	const y = -e.offsetY + H/2
	prev = [x, y]
	pressed = true
	
	renderPoints.addPoint(x, y, 0xFF, 0, 0xFF, 10, 10)
})

window.addEventListener('mouseup', e => pressed = false)
window.addEventListener('blur', e => pressed = false)

let numEntrys	 = 0
let prev = null
canvas.addEventListener('mousemove', e => {
	if ( !pressed )
		return
	
	const x = e.offsetX - W/2
	const y = -e.offsetY + H/2

	if ( !prev ) {
		prev = [x, y]
		return
	}
	
	const start = prev
	const end = [x, y]
	prev = [x, y]

	const deltaX = end[0] - start[0]
	const deltaY = end[1] - start[1]
	const dist = (deltaX**2 + deltaY**2)**0.5
	
	numEntrys++
	console.log( deltaX, deltaY )
	
	writeData(end[0], end[1])
	console.log({dist})
	for(let i = 0; i < dist; i++) {
		let x = ( start[0] + (i / dist) * deltaX )
		let y = ( start[1] + (i / dist) * deltaY )
		
		renderPoints.addPoint(x, y, 0xFF, 0, 0xFF, 10, 10)
	}
	
})

export const hehe = 2
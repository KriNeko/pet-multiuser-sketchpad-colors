<div 
	bind:this={canvasContainer}
	use:resizeObserver={normalizeViewPosition}
	class="viewContainer" 
	on:contextmenu|preventDefault={() =>{}}
	on:pointerdown={pointerdown}
>
	<canvas 
		bind:this={canvas}
		class="view"
		width={viewWidth}
		height={viewHeight}
		style="width: {viewWidth}px; height: {viewHeight}px; transform: translate3d({viewX}px, {viewY}px, 0);"
	></canvas>
	
	{#each Object.entries(userMouseIconList) as userMouse(userMouse[0])}
		<div class="userMouse" style="transform: translate3d({userMouse[1].x - 10}px, {userMouse[1].y - 10}px, 0); " >
			<div>{ userMouse[1].login }</div>
		</div>
	{/each}
</div>

<svelte:window 
	on:mouseup={blur}
	on:pointerup={blur}
	on:blur={blur}

	on:pointermove={pointermove}
	on:touchmove={touchmove}
/>



<script>

import { onMount, onDestroy } from 'svelte'
import { resizeObserver } from '@/helpers/resizeObserver.js'
import Menu from '@/components/Menu.svelte'

import { localStorageWritable } from '@/helpers/localStorageWritable.js'
import { lineColor, lineWidth, lineAlpha } from '@/store/settings.js'
import { isAuthorized as _isAuthorized, id as _selfUserID } from '@/store/auth.js'
import { userMap } from '@/store/users.js'
import { rpc } from '@/control/net.js'

let canvas, canvasContainer

let viewWidth = 2000, viewHeight = 2000
let viewX = 0, viewY = 0

$: colorAlphaHex = $lineColor + $lineAlpha.toString(16).padStart(2, '0').match(/..$/)[0]
$: colorAlphaInt = parseInt(colorAlphaHex.slice(1), 16)
$: selfUserID = $_selfUserID
$: isAuthorized = $_isAuthorized

const _drawLine = (x0, y0, x1, y1, strokeStyle = '#CCCCCC50', lineWidth = 1) => {
	ctx.beginPath()
	ctx.lineWidth = lineWidth
	ctx.strokeStyle = strokeStyle
	ctx.moveTo(x0, y0)
	ctx.lineTo(x1, y1)
	ctx.stroke()
	ctx.closePath()
}

const drawGrid = (cellSize = 40, strokeStyle = '#CCCCCC50', lineWidth = 1) => {
	for(let y = 0; y < viewHeight; y += cellSize)
		_drawLine(0, y, viewWidth, y, strokeStyle, lineWidth)
	for(let x = 0; x < viewWidth; x += cellSize)
		_drawLine(x, 0, x, viewHeight, strokeStyle, lineWidth)
}

const lines = []
let dp = 0, pp = 0
globalThis.redraw = () => {
	lines.map(l => drawPont(l))
}

let userMouseIconList = {}

function watchUserMap(_userMap) {
	Object.values(_userMap).map(u => {
		if ( !u.isOnline ) {
			console.log(u)
			delete userMouseIconList[u.id]
			userMouseIconList = userMouseIconList
		}
	})
}
$: watchUserMap($userMap)

const recvMouse = data => {
	const i32 = new Int32Array(data)
	const userID = i32[0]
	let x = i32[1] / 4
	let y = i32[2] / 4
	
	x += viewWidth  / 2
	y += viewHeight / 2
	
	const canvasBBox = canvas.getBoundingClientRect(canvas)
	
	x += canvasBBox.x
	y += canvasBBox.y
	
	//console.log(userID, x, y)
	
	userMouseIconList[userID] = userMouseIconList[userID] || {}
	userMouseIconList[userID].x = x 
	userMouseIconList[userID].y = y
	userMouseIconList[userID].login = $userMap[userID].login
	userMouseIconList = userMouseIconList
}

rpc.parseBinary = data => {
	if ( data.byteLength === 4*3 )
		return recvMouse(data)

	const i32 = new Int32Array(data)
	const userID = i32[0]
	const x0 = i32[1] / 4
	const y0 = i32[2] / 4
	const x1 = i32[3] / 4
	const y1 = i32[4] / 4
	const lineWidth = i32[5]
	const colorAlphaInt = i32[6]

	_drawPont(x0, y0, x1, y1, lineWidth, colorAlphaInt)
}

const _packLineI32a = new Int32Array(7)
const packLine = (userID, x0, y0, x1, y1, lineWidth, colorAlphaInt) => {
	if ( !isAuthorized )
		return
	
	_packLineI32a[0] = userID
	_packLineI32a[1] = Math.round(x0 * 4)
	_packLineI32a[2] = Math.round(y0 * 4)
	_packLineI32a[3] = Math.round(x1 * 4)
	_packLineI32a[4] = Math.round(y1 * 4)
	_packLineI32a[5] = lineWidth
	_packLineI32a[6] = colorAlphaInt
	
	rpc.sendBinary(_packLineI32a)
}



const _mouseData = new Int32Array(3)
const sendMouse = (x, y) => {
	if ( !isAuthorized )
		return

	x -= viewWidth  / 2
	y -= viewHeight / 2
	x *= 4
	y *= 4

	_mouseData[0] = selfUserID
	_mouseData[1] = x
	_mouseData[2] = y
	rpc.sendBinary(_mouseData)
}

let prev = [0, 0]

const _drawPont = (x0, y0, x1, y1, lineWidth, colorAlphaInt) => {
	
	x0 += viewWidth / 2
	y0 += viewHeight / 2
	x1 += viewWidth / 2
	y1 += viewHeight / 2
	
	const deltaX = x1 - x0
	const deltaY = y1 - y0
	const dist = (deltaX**2 + deltaY**2)**0.5
	
	
	let colorAlphaHex = (2**32 + colorAlphaInt).toString(16).padStart(8, '0')
	colorAlphaHex = colorAlphaHex.slice(colorAlphaHex.length - 8)
	
	ctx.lineWidth = 0
	ctx.fillStyle = '#' + colorAlphaHex
	for(let i = 0; i < dist; i++) {
		let x = ( x0 + (i / dist) * deltaX )
		let y = ( y0 + (i / dist) * deltaY )

		ctx.beginPath()
		ctx.arc(x, y, lineWidth, 0, Math.PI * 2, false)
		ctx.fill()
		ctx.closePath()
	}
}
const drawPont = (line) => {
	const [start, end] = line
	const deltaX = end[0] - start[0]
	const deltaY = end[1] - start[1]
	const dist = (deltaX**2 + deltaY**2)**0.5
	
	const [p0, p1] = line
	packLine(
		selfUserID,
		p0[0] - viewWidth  / 2, 
		p0[1] - viewHeight / 2,
		p1[0] - viewWidth  / 2, 
		p1[1] - viewHeight / 2,
		$lineWidth,
		colorAlphaInt
	)
	
	const _lineWidth = $lineWidth
	ctx.lineWidth = 0
	ctx.fillStyle = colorAlphaHex
	for(let i = 0; i < dist; i++) {
		let x = ( start[0] + (i / dist) * deltaX )
		let y = ( start[1] + (i / dist) * deltaY )
		
		ctx.beginPath()
		ctx.arc(x, y, _lineWidth, 0, Math.PI * 2, false)
		ctx.fill()
		ctx.closePath()
	}
}
const drawLine = line => {
	drawPont(line)
	return
	ctx.beginPath()
	ctx.lineWidth = $lineWidth
	ctx.strokeStyle = $lineColor
	ctx.moveTo(...line[0])
	ctx.lineTo(...line[1])
	ctx.stroke()
	ctx.closePath()
}

const getPositionCanvas = e => {
	const { x, y } = canvas.getBoundingClientRect()
	return { x: e.clientX - x, y: e.clientY - y }
}

let startPoint, startMoveView
const move = e => {
	const { x, y } = getPositionCanvas(e)
	if ( isAuthorized ) 
		sendMouse(x, y)
	if ( startPoint ) {
		const line = [startPoint.slice()]
		startPoint[0] = x
		startPoint[1] = y
		line.push(startPoint.slice())
		drawLine(line)
	}
}

const normalizeViewPosition = () => {
	const { width, height } = canvasContainer.getBoundingClientRect()

	const [xMin, xMax] = [0, width  - viewWidth ].sort((l, r) => l - r)
	const [yMin, yMax] = [0, height - viewHeight].sort((l, r) => l - r)
	viewX = Math.max(xMin, Math.min(xMax, viewX))
	viewY = Math.max(yMin, Math.min(yMax, viewY))
}
const centeringViewPosition = () => {
	const { width, height } = canvasContainer.getBoundingClientRect()
	
	viewX = -(viewWidth  - width) / 2
	viewY = -(viewHeight - height) / 2
	normalizeViewPosition()
}
globalThis.centeringViewPosition=centeringViewPosition

const pointermove = e => {
	move(e)
	if ( startMoveView ) {
		const { x, y } = getPositionCanvas(e)
		viewX = e.clientX + startMoveView[0]
		viewY = e.clientY + startMoveView[1]
		normalizeViewPosition()
	}
}
const touchmove = e => {
	move(e.touches[0])
}
const pointerdown = e => {
	if ( e.which === 1 ) {
		const { x, y } = getPositionCanvas(e)
		startPoint = [x, y]
		globalThis.startPoint = startPoint
	}
	if ( e.which === 2 || e.which === 3 )
		startMoveView = [viewX - e.clientX, viewY - e.clientY]
}

const mouseup = e => {

}
const blur = e => {
	startPoint = null
	startMoveView = null
}

let ctx
onMount(() => {
	const { width, height, } = canvas.getBoundingClientRect()
	Object.assign(canvas, { width, height })
	ctx = canvas.getContext('2d')
	drawGrid()
	centeringViewPosition()
	globalThis.ctx=ctx
})

</script>

<style>
.viewContainer {
	width : 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
}
.view {
	position: absolute;
	box-shadow: 0px 0px 10px 1px #000;
    border-radius: 3px;
}


.userMouse {
	position: absolute;
	
	width: 20px;
	border-radius: 50%;

	height: 20px;
	width: 20px;
	border-radius: 50%;
	border: 2px solid #000;	
	
	display: flex;
	justify-content: center;
	
	transform: translate3d(100px, 200px, 0);
	
	opacity: 0.5;
}
.userMouse > div {
	position: absolute;
	top: -15px;
    font-family: 'Roboto', sans-serif;
    font-weight: bold;
    font-size: 12px;
	user-select: none;
	pointer-events: none;
}
</style>
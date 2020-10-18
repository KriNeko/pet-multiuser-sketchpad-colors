<div 
	bind:this={canvasContainer}
	use:resizeObserver={resize}
	class="viewContainer" 
	on:contextmenu|preventDefault
	on:pointerdown={pointerdown}
	
	on:touchstart
	on:touchend 
	on:wheel={wheel}
>
	<canvas bind:this={canvas} class="view" ></canvas>
	
	{#each Object.entries(userMouseIconList) as userMouse(userMouse[0])}
		<div class="userMouse" style="transform: translate3d({userMouse[1].x - 10}px, {userMouse[1].y - 10}px, 0); " >
			<div>{ userMouse[1].login }</div>
		</div>
	{/each}
	

	<TestViewInfo bind:addObj />
	
</div>

<svelte:window 
	on:mouseup={blur}
	on:pointerup={blur}
	on:blur={blur}

	on:pointermove|preventDefault={pointermove}
	on:touchmove|preventDefault={touchmove}
	
/>


<script>

import { onMount, onDestroy } from 'svelte'
import { resizeObserver } from '@/helpers/resizeObserver.js'
import Menu from '@/components/Menu.svelte'
import TestViewInfo from '@/components/TestViewInfo.svelte'

import { localStorageWritable } from '@/helpers/localStorageWritable.js'
import { lineColorAlphaArray, lineWidth } from '@/store/settings.js'
import { isAuthorized as _isAuthorized, id as _selfUserID, login } from '@/store/auth.js'
import { userMap } from '@/store/users.js'
import { rpc } from '@/control/net.js'
import { roomActive } from '@/store/rooms.js'
import { resizeMode } from '@/store/misc.js'

import { penWriterClient } from '@/control/penWriterClient.js'
import { penReader } from '@/control/penReader.js'

import { RenderPoints } from '@/lib/webgl-render-points/RenderPoints.js'
import { parseColorHEX } from '@/lib/webgl-render-points/helpers/utils.js'

let canvas, canvasContainer

let addObj

//let viewWidth = 2000, viewHeight = 2000
let viewWidth = 1000, viewHeight = 1000
let viewX = 0, viewY = 0
//const setViewPos = (x, y) => ( viewX = Math.round(x), viewY = Math.round(y) )

let renderPoints

$: selfUserID = $_selfUserID
$: isAuthorized = $_isAuthorized

let userMouseIconList = {}

const renderDrawPoint = (x, y, r, g, b, a, lineWidth) =>
	renderPoints.addPoint(x, y, r, g, b, a, lineWidth)
const renderDrawLine = (x0, y0, x1, y1, r, g, b, a, lineWidth) => {
	const deltaX = x1 - x0
	const deltaY = y1 - y0
	const dist = (deltaX**2 + deltaY**2)**0.5
	for(let i = 0; i < dist; i += 1) {
		let x = ( x0 + (i / dist) * deltaX )
		let y = ( y0 + (i / dist) * deltaY )
		
		renderDrawPoint(x, y, r, g, b, a, lineWidth)
	}
}
const drawPoint = (x, y) => renderDrawPoint(x, y, ...$lineColorAlphaArray, $lineWidth)
const drawLine = (x0, y0, x1, y1) => renderDrawLine(x0, y0, x1, y1, ...$lineColorAlphaArray, $lineWidth)

const renderClear = () => {
	if ( !renderPoints || $roomActive )
		return
	
	renderPoints.reset()
	penReader.reset()
}
$: renderClear($roomActive)

rpc.parseBinary = data => {
	console.log(data)
	penReader.addBuffer(data)
}
penReader.penDown = (userID, x, y, r, g, b, a, lineWidth) => renderDrawPoint(x, y, r, g, b, a, lineWidth)
penReader.penMove = (userID, x0, y0, x1, y1, r, g, b, a, lineWidth) => renderDrawLine(x0, y0, x1, y1, r, g, b, a, lineWidth)


const getPositionCanvas = e => {
	let { x, y, width, height } = canvas.getBoundingClientRect()
	x = ( e.clientX - x )
	y = ( height - (e.clientY - y) )
	return { x, y }
}

let startPoint, startMoveView
const move = e => {
	let { x, y } = getPositionCanvas(e)
	
	if ( startPoint ) {
		let [x0, y0] = startPoint
		startPoint[0] = x
		startPoint[1] = y
		
		;[x0, y0] = renderPoints.transformPos(x0, y0)
		;[x, y] = renderPoints.transformPos(x, y)
		
		penWriterClient.penMove(x, y)
		drawLine(x0, y0, x, y)
	}
	
	if ( startMoveView ) {
		renderPoints.addViewPos(-e.movementX, e.movementY)
		//normalizeViewPosition( -e.clientX + startMoveView[0], e.clientY + startMoveView[1] )
	}
}

const normalizeViewPosition = (x, y) => {
	const { width, height } = canvasContainer.getBoundingClientRect()

	const [xMin, xMax] = [0, width  - viewWidth ].sort((l, r) => l - r)
	const [yMin, yMax] = [0, height - viewHeight].sort((l, r) => l - r)
	setViewPos( 
		Math.max(xMin, Math.min(xMax, x)),
		Math.max(yMin, Math.min(yMax, y))
	)
}
const centeringViewPosition = () => {
	const { width, height } = canvasContainer.getBoundingClientRect()
	
	//normalizeViewPosition( -(viewWidth  - width ) / 2, -(viewHeight - height) / 2 )
}
globalThis.centeringViewPosition=centeringViewPosition

const pointermove = e => {
	move(e)
}
const touchmove = e => {
	if ( e.touches.length > 1 )
		blur()
	move(e.touches[0])
}
 
const pointerdown = e => {
	if ( $resizeMode )
		return
	
	blur()
	if ( e.which === 1 ) {
		let { x, y } = getPositionCanvas(e)
		startPoint = [x, y]
		
		;[x, y] = renderPoints.transformPos(x, y)
		penWriterClient.penDown(x, y)
		drawPoint(x, y)

	}
	
	if ( e.which === 3 /* || e.which === 2 */ )
		startMoveView = [viewX - e.clientX, viewY - e.clientY]
}

const mouseup = e => {

}
const blur = e => {
	if ( startPoint ) {
		penWriterClient.penUp()
	}
	startPoint = null
	startMoveView = null
}

let ctx
onMount(() => {
	renderPoints = new RenderPoints(canvas, {
		viewWidth,
		viewHeight,
	})
	centeringViewPosition()
})
onDestroy(() => {
	renderPoints.delete()
})
 
const resize = () => {
	let { width, height } = canvasContainer.getBoundingClientRect()
	width = Math.ceil(width)
	height = Math.ceil(height)
	
	canvas.width  = width
	canvas.height = height
	
	viewWidth  = width
	viewHeight = height
	
	renderPoints.setViewSize(width, height)	
}

const wheel = e => {
	let { x, y } = getPositionCanvas(e)
	renderPoints.addScale( Math.sign( e.deltaY ) * 0.1, x, y )
}

const watchViewResize = () => {
	if ( !renderPoints || !addObj )
		return
	
	addObj({
		x: viewX,
		y: viewY,
		w: viewWidth,
		h: viewHeight,
	})
	
	renderPoints.setViewSize(viewWidth, viewHeight)
}

$: viewWidth, viewHeight, viewX, viewY, addObj, renderPoints, watchViewResize()

$: {
	if ( $resizeMode )
		blur()
}

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
	
	top : 0px;
	left: 0px;
	width : 100%;
	height: 100%;
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
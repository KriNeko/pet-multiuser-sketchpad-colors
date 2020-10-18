{#if $selfRoomActive}
	<div
		transition:slide|local
		class="roomActive" 
		on:mousedown|stopPropagation
		on:click={() => roomsShow = true}
	>
		<div class="room" >
			{ $selfRoomActive?.roomName }
			<div style="width: 4px" ></div>
			(<div class="numUsersOnline" >{ $selfRoomActive?.numUsersOnline }</div>)
		</div>
	</div>
{/if}
<!--
<div class="container" class:roomsShow={roomsShow || !$selfRoomActive} on:mousedown|stopPropagation >
	<div class="roomsWrapper" >
		<input 
			class="inputNewRoom" 
			placeholder="Create new room" 
			bind:value={newRoomName}
			on:keydown={newroomKeydown}
			use:useFocus	
		/>
		<div class="roomList" >
			{#each $rooms as room(room.roomName)}
				<div 
					class="room" 
					on:click={() => roomConnect(room)} 
					style="
						position: absolute;
						top: {room.order * roomHeight}px;
						z-index: {room.zIndex};
					"
					class:active={$selfRoomActive?.id === room.id}
				>{ room.roomName }
					{#if room.numUsersOnline }
						<div style="width: 4px" ></div>
						(<div class="numUsersOnline" >{room.numUsersOnline}</div>)
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
-->

<svelte:window on:mousedown={() => $selfRoomActive && (roomsShow = false)} />

<script>

import { slide } from 'svelte/transition'
import { currentRoom, roomMap, roomActive } from '@/store/rooms.js'
import { id as selfUserID } from '@/store/auth.js'
import { userMap } from '@/store/users.js'
import { rpc, isConnected } from '@/control/net.js'
import { penWriterClient } from '@/control/penWriterClient.js'

import { lineColorAlphaArray, lineWidth } from '@/store/settings.js'

import { users, rooms, selfRoomActive } from '@/store/common.js'

const roomHeight = 20

$: selfRoom = ''
const useFocus = e => !$currentRoom && e.focus()

let roomsShow = true

let newRoomName = ''
function watchNewRoomName() {
	newRoomName = newRoomName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 14)
}
$: watchNewRoomName(newRoomName)

const newroomKeydown = async e => {
	if ( e.which !== 13 )
		return

	if ( newRoomName.length < 3 )
		return

	roomCreate(newRoomName)
}

const roomCreate = async roomName => {
	try {
		await rpc.call('actionRoomCreate', { roomName })
		await roomConnect({ roomName })
		newRoomName = ''
	} catch {
	}
}
const roomConnect = async room => {
	if ( $selfRoomActive?.id === room.id )
		return
	try {
		$roomActive = null
		$roomActive = await rpc.call('actionRoomConnect', { roomName: room.roomName })
	} catch {
	}
}

function watchPenColor() {
	if ( !$roomActive ) return
	penWriterClient.penSetColor(...$lineColorAlphaArray)
}
$: watchPenColor($roomActive, $lineColorAlphaArray)
function watchPenLineWidth() {
	if ( !$roomActive ) return
	penWriterClient.penSetLineWidth($lineWidth)
}
$: watchPenLineWidth($roomActive, $lineWidth)

</script>

<style>
* {
	user-select: none;
	font-family: 'Bebas Neue';
}
.roomActive {
	position: fixed;
	top: 30px;
	display: flex;
	max-height: 22px;
	overflow: hidden;
	transition: all 0.3s;
	padding-left: 10px;
}

.container {
	position: fixed;
	top: 50px;
	display: flex;
	flex-direction: column;
	width: 150px;
	height: calc(100% - 50px - 100px);
	left: -300px;
	transition: all 0.3s;
}
.container > * {
	margin-left: 10px;
}
.numUsersOnline {
	color: #0a960a;
}
.room {
	display: flex;
	cursor: pointer;
	transition: all 0.3s;
}
.room:hover {
	text-shadow: 0 0 5px black;
}
.room.active {
	text-shadow: 0 0 5px black;
}

.roomsWrapper {
	position: relative;
	transition: all 0.3s;
	height: 100%;
}

.roomList {
    position: relative;
	height: 80%;
	overflow-x: hidden;
	overflow-y: auto;
}
.roomList::-webkit-scrollbar { width: 10px; }
.roomList::-scrollbar-track { }
.roomList::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 10px; outline: none; }
.roomsShow {
	left: 0px;
}

.inputNewRoom {
	width: 80px;
	outline: none;
	border: none;
	background: none;
}
</style>
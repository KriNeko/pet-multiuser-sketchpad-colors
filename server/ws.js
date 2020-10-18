
import WebSocket from 'ws'
import crypto from 'crypto'
import { EventEmitter } from 'events'
import fs from 'fs'

import { PenWriter } from './penWR/PenWriter.js'
import { PenWriterGroup } from './penWR/PenWriterGroup.js'

import Users from './components/users.js';
import Rooms from './components/rooms.js';
import ClientGuest from './components/rpc/guest.js';

const ERROR_INVALID_INPUT_DATA = 'ERROR_INVALID_INPUT_DATA'
const ERROR_ESSENCE_ALREADY_EXISTS = 'ERROR_ESSENCE_ALREADY_EXISTS'
const ERROR_ESSENCE_NOT_FOUND = 'ERROR_ESSENCE_NOT_FOUND'
const ERROR_NO_AUTHORIZATION = 'ERROR_NO_AUTHORIZATION' 
const ERROR_ALREADY_AUTHORIZATION = 'ERROR_ALREADY_AUTHORIZATION'
const ERROR_INVALID_RPC_RPCID = 'ERROR_INVALID_RPC_RPCID'
const ERROR_INVALID_RPC_METHOD = 'ERROR_INVALID_RPC_METHOD'
const ERROR_ALREADY_CLIENT_CONNECTING = 'ERROR_ALREADY_CLIENT_CONNECTING'
const PORT = 7934;
 
const validUserLogin = login => /^[a-z0-9_]{1,14}$/.test(login)
const validRoomName = validUserLogin

const DEBUG_MODE = process.env.DEBUG_MODE || 0;

process.on('uncaughtException', (error) => {
	if (error) {
		console.error(error.message);
		console.error(error.stack);
	}
	process.exit(1);
});

process.on('unhandledRejection', (error) => {
	if (error) {
		console.error(error.message);
		console.error(error.stack);
	}
});

const sendBroadcast = (data, room, withoutUser) => {
	for(const client of clients)
		if ( ( !room || client.room === room ) && client !== withoutUser )
			client.send(data)
}
const sendBroadcastJSON = (data, room, withoutUser) => sendBroadcast(JSON.stringify(data), room, withoutUser)



// let roomNextID = 1

const sessions = new Map()
const users = new Users()
const rooms = new Rooms()
const clients = []
 

if(DEBUG_MODE){
	setInterval(() => {
		
		console.log('Num clients %s', clients.length)
		console.log('Num users clients %s', [...users.values()].filter(v => v.client).length )
		console.log('Num rooms clients %s', [...rooms.values()].filter(v => v.clients.size).length )
		console.log('Num users %s', users.size)
	
	}, 1e3)
}


/*
cd mcolorsv
pm2 stop ws
pm2 start ws.js
*/

const webSocketServer = new WebSocket.Server({
	port: PORT,
	host: '0.0.0.0',
	
	perMessageDeflate: {
		zlibDeflateOptions: {
			chunkSize: 1024,
			memLevel: 7,
			level: 3
		},
		zlibInflateOptions: {
			chunkSize: 10 * 1024
		},
		// Other options settable:
		clientNoContextTakeover: true, // Defaults to negotiated value.
		serverNoContextTakeover: true, // Defaults to negotiated value.
		serverMaxWindowBits: 10, // Defaults to negotiated value.
		// Below options specified as default values.
		concurrencyLimit: 10, // Limits zlib concurrency for perf.
		threshold: 1024 // Size (in bytes) below which messages
		// should not be compressed.
	}
})
.on('connection', function connection(webSocket) {
	new ClientGuest(webSocket)
})
.on('error', e => console.log('WebSocketServer error: ' + e.message))
.on("listening", () => console.log(`WS Server started. Port: ${PORT}`))

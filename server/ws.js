import WebSocket from 'ws'

import Storage from './components/storage.js';
import ClientGuest from './components/rpc/guest.js';
import {PORT} from './contstants.js';

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

Storage.initInstance();

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

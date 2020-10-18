
import { PromiseEx } from '@/helpers/PromiseEx.js'

import { writable } from 'svelte/store'

export const isConnected = writable( false )

class WebSocketRPCClient {
	constructor(webSocket) {
		this.webSocket = webSocket
		this.nextRpcID = 1
		this.map = {}
		
		const noop = () => {}
		this.subscribeMap = {}
		this.wsEvents = Object.entries({
			message: ({data}) => {
				if ( data instanceof ArrayBuffer )
					return this.parseBinary(data)

				try {
					const json = JSON.parse(data)
					
					const promise = this.map[ json.rpcID ]
					if ( promise ) {
						delete this.map[ json.rpcID ]
						if ( json.errorCode ) {
							const e = new Error(json.errorCode)
							Object.assign(e, json)
							promise.reject(e)
							return
						}
						
						promise.resolve(json.result)
						return
					}
					
					(this.subscribeMap[ json.action ] || []).map(f => f(json.data))
					
				} catch(e) {
					console.log(e)
				}
			},
			close: () => this.detach()
		})
	}

	attach(webSocket) {
		this.detach()
		
		this.webSocket = webSocket
		this.webSocket.binaryType = 'arraybuffer'
		this.wsEvents.map(v => this.webSocket.addEventListener(...v))
	}
	detach() {
		if ( this.webSocket ) {
			this.wsEvents.map(v => this.webSocket.removeEventListener(...v))
			this.webSocket = null
		}

		Object.values(this.map).map(p => p.reject({ errorCode: 'ERROR_NETWORK' }))
		this.map = {}
	}

	async call(action, data) {
		if ( !this.webSocket ) return
		const rpcID = this.nextRpcID++
		this.webSocket.send( JSON.stringify( { rpcID, action, data } ) )
		return this.map[rpcID] = new PromiseEx()
	}
	
	sendBinary(data) {
		if ( !this.webSocket ) return
		this.webSocket.send(data)
	}
	
	subscribe(action, callback) {
		( this.subscribeMap[action] = this.subscribeMap[action] ?? [] ).push( callback )
	}

	parseBinary() {}
	
}

export const rpc = new WebSocketRPCClient()
globalThis.rpc = rpc

const wsUrl = /krineko/i.test( location.hostname ) ?
	'wss://paint.jsx.su/ws' :
	`ws://${ location.hostname }:7934`

function wsReconnect() {
	const webSocket = new WebSocket( wsUrl )
	webSocket.addEventListener('open', () => {
		rpc.attach( webSocket )
		isConnected.set( true )
	})
	webSocket.addEventListener('close', () => {
		isConnected.set( false )
		setTimeout(wsReconnect, 2e3)
	})
	webSocket.addEventListener('message', msg => {		
	})
	webSocket.addEventListener('error', e => {
		console.log(e)
	})
}
wsReconnect()

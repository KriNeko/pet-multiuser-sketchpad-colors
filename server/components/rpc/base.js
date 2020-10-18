import Result from '../result.js';

export default class RPCClientBase {
	constructor(webSocket) {
		const methodNameList = Object.getOwnPropertyNames(this.__proto__)
		
		const middlewareMethodNameList = methodNameList
			.filter(p => p.indexOf('middleware') === 0)
			.sort((l, r) => l.length - r.length)

		const actionMehtodNameList = methodNameList
			.filter(p => p.indexOf('action') === 0)

		;[...actionMehtodNameList, ...middlewareMethodNameList]
			.map(a => this[a] = this[a].bind(this))
		
		this.__actionMehtodNameSet = new Set( actionMehtodNameList )
		
		this.__actionsMiddlewareMap = new Map();
		[...actionMehtodNameList].map(method => {
			const middlewarePattern = 'middleware' + method[0].toUpperCase() + method.slice(1)
			const m = middlewareMethodNameList.filter( m => middlewarePattern.indexOf(m) === 0 )
			if ( m.length )
				this.__actionsMiddlewareMap.set(method, m.map(m => this[m]))
		})
		
		this.__webSocketEvents = {
			message: m => {
				try {
					if ( m instanceof Buffer )
						this.parseBinary(m)
					else
						this.parseJSON(JSON.parse(m))
				} catch(e) {
					console.log('WebSocketClient parse message error: ' + e?.message)
				}
			},
			close: () => {
				
			},
			error: e => console.log('WebSocketClient error: ' + e.message)
		}
		
		this.webSocket = webSocket
		this.__webSocketAddEvents()
	}
	__webSocketAddEvents() {
		Object.entries(this.__webSocketEvents).map(([k, f]) => this.webSocket.on(k, f))
	}
	__webSocketDelEvents() {
		Object.entries(this.__webSocketEvents).map(([k, f]) => this.webSocket.off(k, f))
	}

	attach() { this.__webSocketAddEvents() }
	detach() { this.__webSocketDelEvents() }
	close() {
		this.detach()
		this.webSocket.close()
	}
	
	parseBinary() {}

	async parseJSON(obj) {
		const action = String(obj?.action)
		const rpcID = String(obj?.rpcID)
		const data = obj?.data ?? {}

		try {
			throw await this.parseRPCMethod(rpcID, action, data)
		} catch(e) {
			this.sendJSONResult(rpcID, e)
		}
	}
	async parseRPCMethod(rpcID, action, data) {
		if ( !rpcID )
			throw Result.error(ERROR_INVALID_RPC_RPCID)
		
		if ( !this.__actionMehtodNameSet.has( action ) )
			throw Result.error(ERROR_INVALID_RPC_METHOD)

		const middlewares = this.__actionsMiddlewareMap.get(action)
		if ( middlewares )
			middlewares.map( f => f(action, data, this, this.user) )

		return await this[ action ](data, this, this.user)
	}

	send(data) {
		try {
			this.webSocket.send(data)
		} catch(e) {
			console.log('WebSocket send error: ' + e.message)
			console.log(e)
		}
	}
	sendJSON(obj) {
		this.send(JSON.stringify(obj))
	}
	sendJSONResult(rpcID, result) {
		let resultJSON;

		if ( !(result instanceof Result) ) {
			console.error('WebSocketClient parse client message error: ' + result?.message)
			console.error(result)
		}

		try {
			result.rpcID = rpcID
			resultJSON = JSON.stringify(result)
		} catch {
			resultJSON = JSON.stringify({ rpcID })
		}
		
		this.send( resultJSON )
	}
}

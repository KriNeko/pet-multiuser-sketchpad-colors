
import WebSocket from 'ws'
import crypto from 'crypto'
import { EventEmitter } from 'events'
import fs from 'fs'

import { PenWriter } from './penWR/PenWriter.js'
import { PenWriterGroup } from './penWR/PenWriterGroup.js'

const ERROR_INVALID_INPUT_DATA = 'ERROR_INVALID_INPUT_DATA'
const ERROR_ESSENCE_ALREADY_EXISTS = 'ERROR_ESSENCE_ALREADY_EXISTS'
const ERROR_ESSENCE_NOT_FOUND = 'ERROR_ESSENCE_NOT_FOUND'
const ERROR_NO_AUTHORIZATION = 'ERROR_NO_AUTHORIZATION' 
const ERROR_ALREADY_AUTHORIZATION = 'ERROR_ALREADY_AUTHORIZATION'
const ERROR_INVALID_RPC_RPCID = 'ERROR_INVALID_RPC_RPCID'
const ERROR_INVALID_RPC_METHOD = 'ERROR_INVALID_RPC_METHOD'
const ERROR_ALREADY_CLIENT_CONNECTING = 'ERROR_ALREADY_CLIENT_CONNECTING'
 
const validUserLogin = login => /^[a-z0-9_]{1,14}$/.test(login)
const validRoomName = validUserLogin



const sendBroadcast = (data, room, withoutUser) => {
	for(const client of clients)
		if ( ( !room || client.room === room ) && client !== withoutUser )
			client.send(data)
}
const sendBroadcastJSON = (data, room, withoutUser) => sendBroadcast(JSON.stringify(data), room, withoutUser)

class Result {
	constructor(obj, errorCode = '', errorMessage = '') {
		this.rpcID = null
		this.result = obj
		
		this.errorCode = errorCode
		this.errorMessage = errorMessage
	}
	
	static success(obj = {}) {
		return new this(obj)
	}
	static error(errorCode = '', errorMessage = '') {
		return new this(null, errorCode, errorMessage)
	}
}

let roomNextID = 1
class Room {
	constructor(roomName, userCreator) {
		this.id = roomNextID++
		this.timeCreate = Date.now()
		this.roomName = roomName
		this.userCreator = userCreator

		this.users = new Set([])
		this.usersOnline = new Set()
		this.clients = new Set()
		
		this.buffer = Buffer.alloc(0)

		this.penWriter = new PenWriter(1024*1024)
	}

	analysisRecvData(userID, data) {
		if ( !this.penWriter.canWrite() )
			return
		
		this.penWriter.analysisRecvData(userID, data)
		console.log( this.penWriter.bufferWriter.writeOffset )
	}

	toSendFormat() {
		return {
			id: this.id,
			timeCreate: this.timeCreate, 
			roomName: this.roomName, 
			numUsers: this.users.size,
			numUsersOnline: this.usersOnline.size
		}
	}
}
class Rooms extends Map {
	parseRoomName(obj) {
		const roomName = String(obj?.roomName)
		if ( !validRoomName(roomName) )
			throw Result.error(ERROR_INVALID_INPUT_DATA)
		
		return { roomName }
	}

	actionRoomCreate(obj, client, user) {
		const { roomName } = this.parseRoomName(obj)

		if ( this.has(roomName) )
			throw Result.error(ERROR_ESSENCE_ALREADY_EXISTS)
		
		const room = new Room(roomName, user)
		this.set(roomName, room)

		return Result.success(room.toSendFormat())
	}

	getRoom(obj) {
		const { roomName } = this.parseRoomName(obj)
		
		const room = this.get(roomName)
		if ( !room )
			throw Result.error(ERROR_ESSENCE_NOT_FOUND)
		
		return room
	}
}

let userNextID = 1
class User {
	constructor(login, password) {
		this.id = roomNextID++
		this.timeCreate = Date.now()
		this.login = login
		this.password = password
		this.isOnline = false
		this.client = null
	}
	
	createSession() {
		const session = crypto.randomBytes(32).toString('hex')
		sessions.set(session, this)
		return session
	}
	
	toSendFormat() {
		return {
			timeCreate: this.timeCreate,
			id: this.id,
			login: this.login,
		}
	}
}
class Users extends Map {
	userPrepareLoginPassword(obj) {
		const login = String(obj?.login).toLowerCase()
		const password = String(obj?.password)
		
		if ( !validUserLogin(login) )
			throw Result.error(ERROR_INVALID_INPUT_DATA)
		
		return {login, password}
	}
	userCreateSession(user) {
		return Result.success({ session: user.session() })
	}
	actionUserAuthSignin(obj, client) {
		const {login, password} = this.userPrepareLoginPassword(obj)
		const user = this.get(login)
		if ( user?.password !== password )
			throw Result.error(ERROR_INVALID_INPUT_DATA)

		if ( user.client )
			throw Result.error(ERROR_ALREADY_CLIENT_CONNECTING)

		const session = user.createSession()
		
		return Result.success({ ...user.toSendFormat(), session })
	}
	actionUserAuthSignup(obj, client) {
		const {login, password} = this.userPrepareLoginPassword(obj)
		if ( this.has(login) )
			throw Result.error(ERROR_ESSENCE_ALREADY_EXISTS)

		const user = new User(login, password)
		this.set(login, user)
		const session = user.createSession()
		
		return Result.success({ ...user.toSendFormat(), session })
	}
	actionUserAuthSession(obj, client) {
		const session = String(obj?.session)
		const user = sessions.get( session )
		if ( !user )
			throw Result.error(ERROR_INVALID_INPUT_DATA)
		
		if ( user.client )
			throw Result.error(ERROR_ALREADY_CLIENT_CONNECTING)
		
		return Result.success({ ...user.toSendFormat(), session })
	}
	actionUserIsFreeLogin(obj) {
		const {login, password} = this.userPrepareLoginPassword(obj)
		if ( this.has(login) )
			throw Result.error(ERROR_ESSENCE_ALREADY_EXISTS)

		return Result.success( true )
	}

}

const sessions = new Map()
const users = new Users()
const rooms = new Rooms()
const clients = []
 
class RPCClientBase {
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

class ClientGuest extends RPCClientBase {
	constructor(webSocket) {
		super(webSocket)
	}
	
	_actionUserAuthAddUser(result) {
		const user = users.get( result.result.login )
		const session = result.result.session

		this.detach()
		new Client(this.webSocket, user, session)

		return result
	}
	actionUserAuthSignin(obj)  { return this._actionUserAuthAddUser( users.actionUserAuthSignin(obj)  ) }
	actionUserAuthSignup(obj)  { return this._actionUserAuthAddUser( users.actionUserAuthSignup(obj)  ) }
	actionUserAuthSession(obj) { return this._actionUserAuthAddUser( users.actionUserAuthSession(obj) ) }
}
class Client extends RPCClientBase {
	constructor(webSocket, user, session) {
		super(webSocket)

		this.user = user
		this.session = session
		this.room = null
		
		this.user.client = this

		this.isOnline = false

		clients.push(this)

		this.sendBroadcastJSON('userList', clients.map(c => c.toSendFormat()) )
		this.sendBroadcastJSON('roomList', [...rooms.values()].map(c => c.toSendFormat()) )
		
		this.webSocket.on('close', () => this.destroy())
	}

	toSendFormat() {
		return {
			id: this.user.id,
			timeCreate: this.user.timeCreate,
			login: this.user.login,
			
			roomID  : this.room?.id,
			isOnline: this.isOnline,
		}
	}
	sendBroadcastJSON(action, data) {
		sendBroadcastJSON({ action, data })		
	}
	sendBroadcastThisUser() {
		this.sendBroadcastJSON('user', this.toSendFormat())
	}

	actionUserSetOnlineStatus(obj) {
		this.isOnline = obj.isOnline
		this.sendBroadcastThisUser()
		return Result.success(true)
	}

	actionRoomCreate(obj) {
		const result = rooms.actionRoomCreate(obj)
		
		const room = rooms.get(result.result.roomName)
		this.sendBroadcastJSON('room', room.toSendFormat())
		
		return result
	}
	actionRoomConnect(obj) {
		const room = rooms.getRoom(obj)

		this.actionRoomDisconnect()

		this.room = room
		this.room.clients.add(this)
		
		this.penWriterReadOffset = 0
		this.sendPenWriterData()
		
		this.sendBroadcastThisUser()
		
		return Result.success(room.toSendFormat())
	}
	actionRoomDisconnect() {
		if ( !this.room )
			return Result.success(false)

		this.room.clients.delete(this)
		this.room = null
		
		this.sendBroadcastThisUser()
		
		return Result.success(true)
	}

	sendPenWriterData() {
		const data = this.room.penWriter.readData(this.penWriterReadOffset)
		this.penWriterReadOffset += data.length
		this.send(data)
	}

	destroy() {
		this.isOnline = false
		this.actionRoomDisconnect()
		this.sendBroadcastThisUser()
		
		clients.splice(clients.indexOf(this), 1)
		this.user.client = null	
		this.webSocket.close()
	}
	
	
	
	parseBinary(data) {
		if ( !this.room )
			return
		
		this.room.analysisRecvData(this.user.id, data)
	
		for(const client of this.room.clients.values()) {
			if ( client === this ) continue
			client.sendPenWriterData()
		}
	}
} 	

if(0)
setInterval(() => {
	
	console.log('Num clients %s', clients.length)
	console.log('Num users clients %s', [...users.values()].filter(v => v.client).length )
	console.log('Num rooms clients %s', [...rooms.values()].filter(v => v.clients.size).length )
	console.log('Num users %s', users.size)

}, 1e3)


/*
cd mcolorsv
pm2 stop ws
pm2 start ws.js
*/

const webSocketServer = new WebSocket.Server({
	port: 7934,
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

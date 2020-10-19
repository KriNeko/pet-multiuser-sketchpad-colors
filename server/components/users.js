import Result from './result.js';
import Storage from './storage.js';
import User from './user.js';
import {
	ERROR_INVALID_INPUT_DATA,
	ERROR_ESSENCE_ALREADY_EXISTS,
	ERROR_ALREADY_CLIENT_CONNECTING
} from '../contstants.js';
import {validUserLogin} from '../utils.js'

export default class Users extends Map {
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
		const user = Storage.getInstance().sessions.get( session )
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

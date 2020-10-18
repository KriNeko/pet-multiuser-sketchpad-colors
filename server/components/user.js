export default class User {
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

import crypto from 'crypto';

import Storage from './storage.js';

export default class User {
	constructor(login, password) {
		this.id = Storage.getInstance().getNextUserID();
		this.timeCreate = Date.now()
		this.login = login
		this.password = password
		this.isOnline = false
		this.client = null
	}
	
	createSession() {
		const session = crypto.randomBytes(32).toString('hex')
		Storage.getInstance().sessions.set(session, this);
		
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

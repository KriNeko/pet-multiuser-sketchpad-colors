import RPCClientBase from './base.js';
import Client from './client.js';
import Storage from '../storage.js';

export default class ClientGuest extends RPCClientBase {
	constructor(webSocket) {
		super(webSocket)
	}
	
	_actionUserAuthAddUser(result) {
		const user = Storage.getInstance().users.get( result.result.login )
		const session = result.result.session

		this.detach()
		new Client(this.webSocket, user, session)

		return result
	}
	actionUserAuthSignin(obj)  { return this._actionUserAuthAddUser( Storage.getInstance().users.actionUserAuthSignin(obj)  ) }
	actionUserAuthSignup(obj)  { return this._actionUserAuthAddUser( Storage.getInstance().users.actionUserAuthSignup(obj)  ) }
	actionUserAuthSession(obj) { return this._actionUserAuthAddUser( Storage.getInstance().users.actionUserAuthSession(obj) ) }

	actionUserIsFreeLogin(obj) { return Storage.getInstance().users.actionUserIsFreeLogin(obj) }
}
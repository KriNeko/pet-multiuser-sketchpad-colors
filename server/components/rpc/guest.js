import RPCClientBase from './base.js';
import Client from './client.js';

export default class ClientGuest extends RPCClientBase {
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

	actionUserIsFreeLogin(obj) { return users.actionUserIsFreeLogin(obj) }
}
export class PromiseEx extends Promise {
	constructor(callback) {
		let resolve, reject
		super( (_resolve, _reject) => (resolve = _resolve, reject = _reject) )
		
		this.resolve = resolve
		this.reject  = reject
		if ( callback )
			callback(resolve, reject)
	}
}
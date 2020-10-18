export default class Result {
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

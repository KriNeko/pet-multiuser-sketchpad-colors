
export const sleep = (msec, value) => new Promise(resolve =>
	setTimeout( () => resolve(value), msec )
)

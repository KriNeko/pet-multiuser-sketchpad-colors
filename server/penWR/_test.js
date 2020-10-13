
import { PenReader } from './PenReader.js'
import { PenWriter } from './PenWriter.js'

export function test() {
	const userIDList = Array(250).fill(0).map((v, i) => i)
	
	const rndInt = (min, max) => (Math.random() * (max - min + 1) | 0) + min
	
	for(let j = 0; j < 10; j++) {
		const pw = new PenWriter(1024*1024*64)
		
		let history = []
		for(let i = 0; i < 1000000; i++) {
			const userID = userIDList[Math.random()*userIDList.length | 0]
			
			let coordSize
			const r = Math.random()
			if ( r < 0.3 )
				coordSize = 1
			else if ( r < 0.5 )
				coordSize = 50
			else if ( r < 0.7 )
				coordSize = 300
			else 
				coordSize = 2000

			const obj = {
				userID, 
				x: rndInt(-coordSize, coordSize),
				y: rndInt(-coordSize, coordSize),
			}
			
			
			history.push(obj)
			
			if ( Math.random() < 0.1 )
				pw.penDown(obj.userID, obj.x, obj.y)
			else
				pw.penMove(obj.userID, obj.x, obj.y)
		}
		
		const pr = new PenReader()
		let i = 0
		pr.penMove = (userID, x0, y0, x1, y1) => {
			const obj = history[i++]
			if ( obj.userID !== userID || obj.x !== x1 || obj.y !== y1 ) {
				console.error(obj, {userID, x1, y1})
				console.error(pr.userIDList)
				console.error(history.slice(0, i))
				throw new Error(`Test failed...`)
			}
		}
		pr.penDown = (userID, x, y) => pr.penMove(userID, 0, 0, x, y)
		pr.addBuffer( pw.bufferWriter.buffer.buffer, pw.numMessages )
	}
	console.log('Test success')
}
test()
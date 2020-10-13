
import { PenWriter } from './PenWriter.js'

export class PenWriterGroup {
	constructor(maxPenWriterSize, numMaxPenWriters) {
		this.maxPenWriterSize = maxPenWriterSize
		this.numMaxPenWriters = numMaxPenWriters
		
		this.penWriterList = []
	}
	
	addPenWriter() {
		if ( this.penWriterList.length >= this.numMaxPenWriters )
			return false
		
		this.penWriterList.push( new PenWriter(this.maxPenWriterSize) )
		return true
	}
	getPenWriter() {
		while(1) {
			const pw = this.penWriterList[ this.penWriterList.length - 1 ]
			if ( !pw || !pw.canWrite() ) {
				if ( !this.addPenWriter() )
					return null
				
			}
			
			return pw
		}
	}
	
	getNumPenWriters() {
		return this.penWriterList.length
	}
	
}

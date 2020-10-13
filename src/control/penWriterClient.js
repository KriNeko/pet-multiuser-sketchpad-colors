
import { PenWriterClient } from './../../server/penWR/PenWriterClient.js'
import { rpc } from './net.js'

export const penWriterClient = new PenWriterClient()
penWriterClient.sendBinary = data => rpc.sendBinary(data)
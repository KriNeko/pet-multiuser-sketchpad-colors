
<Input 
	placeholder="Enter login" 
	bind:value={login}
	bind:valid={_valid}
	{status}
	minNumChars=4 
	maxNumChars=12 
/>
		
<script>

import { onDestroy } from 'svelte'
import { rpc } from '@/control/net.js'
import Input from '@/components/leaves/Input.svelte'
import { sleep } from '@/helpers/utils.js'
import { setTimeoutOnceInTime } from '@/helpers/setTimeoutOnceInTime.js'
import { setIntervalSvelte } from '@/helpers/setIntervalSvelte.js'

/**
type = 'signin'
type = 'signup'
*/

export let type = 'signin'
export let login = ''
export let valid = false

let status = null
let _valid = false

let loginBusyMap = new Map()
setIntervalSvelte(onDestroy)(5e3)(() => {
	const now = Date.now();
	[...loginBusyMap].map(v => {
		if ( v[1].time + 30e3 < now )
			loginBusyMap.delete(v[0])
	})
	loginBusyMap = loginBusyMap
})
async function watchLoginBusyMap() {
	if ( !_valid ) {
		valid = false
		status = null
		return
	}

	const exists = loginBusyMap.get(login)
	if ( exists?.data === null ) {
		valid = false
		status = { loading: true }
		return
	}
	
	if ( exists ) {
		if ( type === 'signin' ) {
			if ( !exists.data ) {
				valid = false
				status = { error: 'Login not found' }
			} else {
				valid = true
				status = { success: 'You can try' }
			}		
		} else {
			if ( exists.data ) {
				valid = false
				status = { error: 'Login busy' }
			} else {
				valid = true
				status = { success: 'Login free' }
			}
		}
		
		return
	}
	
	valid = false
	status = { loading: true }

	const _login = login
	
	const dst = { time: Date.now(), data: null }
	loginBusyMap.set(_login, dst)
	//await sleep(1000)
	
	const ret = await rpc.call('actionUserIsFreeLogin', {login: _login}).catch(v => v)
	if ( ret?.errorCode === 'ERROR_ESSENCE_ALREADY_EXISTS' ) {
		dst.time = Date.now()
		dst.data = true
	} else if ( ret === true ) {
		dst.time = Date.now()
		dst.data = false
	} else {
		if ( loginBusyMap.set(_login) === dst )
			loginBusyMap.delete(_login)
	}
	
	loginBusyMap = loginBusyMap	
}
$: login, loginBusyMap, type, watchLoginBusyMap()

</script>
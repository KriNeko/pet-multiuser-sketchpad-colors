<Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  escapeKeyAction={''}
  scrimClickAction={''}
>
	<div class="container" >
        <Textfield bind:value={$login} bind:invalid={loginInvalid} bind:focus={loginFocus} label="Enter login" input$aria-controls="_ld32dbd" input$aria-describedby="_ld32dbd" />
        <HelperText id="_ld32dbd">{ loginHelperText ?? '[a-z] 4-14 chars' }</HelperText>
		
        <Textfield bind:value={password} bind:invalid={passwordInvalid} label="Enter password" input$aria-controls="_b45bdfd" input$aria-describedby="_b45bdfd" />
        <HelperText id="_b45bdfd">[a-z] 4-14 chars</HelperText>
		
		<Button on:click={signinup} disabled={!loginInvalid && !passwordInvalid} >Signup or signin</Button>
	</div>

</Dialog>

<script>

import { onMount } from 'svelte'
import Dialog, {Title, Content, Actions} from '@smui/dialog';
import Button, {Label} from '@smui/button';
import Textfield from '@smui/textfield'
import HelperText from '@smui/textfield/helper-text'

import { isAuthorized } from '@/store/auth.js'
import { selfIsOnline } from '@/store/selfIsOnline.js'
import { rpc, isConnected } from '@/control/net.js'
import { id as userID, login, session } from '@/store/auth.js'

$: !$isConnected && ( $isAuthorized = false )

const validUserLogin = login => /^[a-z0-9_]{1,14}$/.test(login)
const validUserPassword = s => /^[a-z0-9_]{6,14}$/.test(s)

let loginInvalid = false, loginFocus = () => {}, loginHelperText = null
let password = '', passwordInvalid = false

function watch() {
	[$login, password] = [$login.toLowerCase(), password].map(c => c.replace(/[^a-z0-9_]/g, '').slice(0, 14))
	loginInvalid = $login && $login.length >= 4
	passwordInvalid = password && password.length >= 4
	loginHelperText = null
}
$: watch($login, password)
let dialog;

let dialogOpen = false

async function checkSession() {
	if ( !$isConnected || $isAuthorized )
		return
	
	if ( $session ) {
		let r = await rpc.call('actionUserAuthSession', { session: $session }).then(r => r).catch(e => e)
		if ( !r.errorCode ) {
			setAuth(r)
			return
		}
	}
	
	dialogOpen = true
}
$: checkSession($isConnected, $isAuthorized)

async function signinup() {
	try {
		let r
		r = await rpc.call('actionUserAuthSignin', { login: $login, password }).then(v => v).catch(v => v)
		if ( r.errorCode === 'ERROR_ALREADY_CLIENT_CONNECTING' ) {
			loginHelperText = 'You are already logged online'
			loginFocus()
			return
		}
		
		if ( r.errorCode )
			r = await rpc.call('actionUserAuthSignup', { login: $login, password })
	
		setAuth(r)
	} catch(e) {
		switch(e.errorCode) {
			case 'ERROR_ESSENCE_ALREADY_EXISTS':
				loginHelperText = 'Login already exists'
				loginFocus()
				break
		}
	}
}
function watchDialog() {
	if ( !dialog )
		return
	if ( dialogOpen )
		dialog.open()
	else 
		dialog.close()
}
$: dialog && watchDialog(dialogOpen)

function setAuth(r) {
	$login = r.login
	$session = r.session
	$userID = r.id
	$isAuthorized = true
	dialogOpen = false
}

async function sendSelfIsOnline() {
	if ( !$isAuthorized )
		return

	await rpc.call('actionUserSetOnlineStatus', { isOnline: $selfIsOnline })
}
$: sendSelfIsOnline($isAuthorized, $selfIsOnline)

</script>

<style>
.container {
    display: flex;
    flex-direction: column;
	padding: 20px;
}

:global(.input) {
    font-family: 'Bebas Neue' !important;
}
</style>
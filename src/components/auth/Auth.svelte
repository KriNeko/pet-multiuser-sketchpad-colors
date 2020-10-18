<FixedLayer show={$isConnected && !$isAuthorized} >
	<div class="container" >
		<div class="flex" >
			<button class="typeBtn" class:active={type === 'signin'} on:click={() => type = 'signin'} >SIGNIN</button>
			<button class="typeBtn" class:active={type === 'signup'} on:click={() => type = 'signup'} >SIGNUP</button>
		</div>
		
		<div style="height: 20px; "></div>
				
		<InputLogin {type} bind:login={$login} bind:valid={loginValid} />
		<div style="height: 20px; "></div>
		<InputPassword bind:password bind:valid={passwordValid} bind:errors={passwordErrors} />
		<div style="height: 20px; "></div>

		<div>
			<Button disabled={!valid} on:click={() => type === 'signin' ? signin() : signup()} >
				<span class="sgBtn" >{ type === 'signin' ? 'SIGN IN' : 'SIGN UP' }</span>
			</Button>
		</div>
		
		<Loading {loading} />

	</div>
</FixedLayer>

<script>

import InputLogin from '@/components/auth/InputLogin.svelte'
import InputPassword from '@/components/auth/InputPassword.svelte'
import Button from '@/components/leaves/Button.svelte'
import Loading from '@/components/leaves/Loading.svelte'
import FixedLayer from '@/components/leaves/FixedLayer.svelte'
import { sleep } from '@/helpers/utils.js'

let type = 'signin'
let loginValid = false, password, passwordValid = false, passwordErrors = []
let loading = false
let errors = []
$: valid = loginValid && passwordValid

import { selfIsOnline } from '@/store/selfIsOnline.js'
import { rpc, isConnected } from '@/control/net.js'
import { isAuthorized, id as userID, login, session } from '@/store/auth.js'

async function signin() {
	if ( !valid )
		return
	
	loading = true
	try {
		setAuth( await rpc.call('actionUserAuthSignin', { login: $login, password }) )
	} catch(e) {
		switch( e?.errorCode ) {
			case 'ERROR_INVALID_INPUT_DATA':
				passwordErrors = ['Password is incorrect', ...passwordErrors]
				break
			
			default:
				passwordErrors = [e?.errorCode, ...passwordErrors]
		}
	}
	loading = false
}
async function signup() {
	if ( !valid )
		return
	
	loading = true
	try {
		setAuth( await rpc.call('actionUserAuthSignup', { login: $login, password }) )
	} catch(e) {
		passwordErrors = [e?.errorCode, ...passwordErrors]
	}
	loading = false
}
async function checkSession() {
	if ( !$isConnected || $isAuthorized )
		return
	
	loading = true
	if ( $session ) {
		try {
			setAuth( await rpc.call('actionUserAuthSession', { session: $session }) )
		} catch(e) {
			$session = null
		}
	}
	loading = false
}
$: $isConnected, $isAuthorized, checkSession()

function setAuth(r) {
	$login = r.login
	$session = r.session
	$userID = r.id
	$isAuthorized = true
}

$: !$isConnected && ($isAuthorized = false)

async function sendSelfIsOnline() {
	if ( !$isAuthorized )
		return

	await rpc.call('actionUserSetOnlineStatus', { isOnline: $selfIsOnline })
}
$: $isAuthorized, $selfIsOnline, sendSelfIsOnline()

</script>

<style>
* {
    font-family: 'Bebas Neue';
}

.container {
	position: relative;
	display: flex;
	flex-direction: column;		
	width: 300px;
	border: 1px solid #DADADA;
	background: #F9F9FA;
	padding: 20px;
	border-radius: 5px;	
}
.flex {
	display: flex;
}
.typeBtn {
	padding: 2px 10px;
	cursor: pointer;
	transition: text-shadow 0.3s;

    outline: none;
    border: none;
    background: none;
	
	font-size: 16px;
}
.typeBtn.active {
	border-bottom: 1px solid #484848;
}
.typeBtn:hover {
	text-shadow: 0 0 5px black;
}

.sgBtn {
	font-size: 16px;
}

</style>
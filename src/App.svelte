
<Api />

<main>

	
	<Auth2 />
	
	<Render />
	
	<MiniMenu />
	<HeaderUsers />
	<RoomList />
	
	<NetLoading />
</main>

<script>

import Api from '@/components/Api.svelte'
import Render from '@/components/Render.svelte'
import MiniMenu from '@/components/MiniMenu.svelte'
import HeaderUsers from '@/components/HeaderUsers.svelte'
import RoomList from '@/components/RoomList.svelte'

import Auth from '@/components/Auth.svelte'
import NetLoading from '@/components/NetLoading.svelte'

import Auth2 from '@/components/auth/Auth.svelte'



</script>


<style>
:global(*) {
	margin : 0px;
	padding: 0px;
	box-sizing: border-box;
	
	-webkit-tap-highlight-color: rgba(0,0,0,0);
	tap-highlight-color: rgba(0,0,0,0);
}

main {
	width : 100vw;
	height: 100vh;	
}	
</style>
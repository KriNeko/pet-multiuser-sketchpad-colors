
<Api />

<main>

	
	<Auth2 />
	
	<Render />
	
	<HeaderUsers />
	<MiniMenu />
	<MiniMenuChangeView />
	
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

import MiniMenuChangeView from '@/components/MiniMenuChangeView.svelte'

import Stats from '@/lib/stats'
const stats = new Stats()
stats.showPanel( 0 )
document.body.appendChild( stats.dom )
function animate() {
	requestAnimationFrame( animate )
	stats.update()
}
requestAnimationFrame( animate )

</script>


<style>
:global(*) {
	margin : 0px;
	padding: 0px;
	box-sizing: border-box;
	
	-webkit-tap-highlight-color: rgba(0,0,0,0);
	tap-highlight-color: rgba(0,0,0,0);
	
	touch-action: none; 
}

main {
	position: absolute;
	top : 0px;
	left: 0px;
	width : 100%;
	height: 100%;
}
</style>
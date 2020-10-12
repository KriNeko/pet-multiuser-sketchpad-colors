<div class="users" >
	<!--
	<div class="user" >
		<Icon class="material-icons" style="font-size: 16px;" 
			on:click={() => (users.map(u => u.isVisibility = !everyUserVisible), users = users)} 
		>
			{#if everyUserVisible }
				visibility
			{:else}
				visibility_off
			{/if}
		</Icon>
	</div>
	-->

	{#each usersFinal as user(user.id)}
		<div 
			class="user" 
			on:click={() => user.isVisibility ^= 1} 
			class:userOnline={user.isOnline}
		>
			{ user.login }
			<div style="width: 4px;" ></div>
			
				<Icon class="material-icons" style="font-size: 16px;" >
					{#if user.isVisibility }
						visibility
					{:else}
						visibility_off
					{/if}
				</Icon>
		</div>
	{/each}
</div>
		
<script>

import { Icon } from '@smui/common'

import { lineColor, lineColorList } from '@/store/settings.js'
import { users, selfRoomActive } from '@/store/common.js'

$: usersFinal = $users
	.filter(u => $selfRoomActive && ( u.roomID === $selfRoomActive?.id ))
	.map((u, i) => ( u.isOnline ? i : i * 1e6, u ))
	.sort((l, r) => l.isOnline ? -1 : 1) 

</script>


<style>
* {
	user-select: none;
}
.users {
	position: fixed;
	top: 10px;
	left: 10px;
	overflow: hidden;
	
	display: flex;
	flex-wrap: wrap;
    column-gap: 5px;
    row-gap: 5px;
	transition: all 1s;
}
.user {
	opacity: 0.6;
	display: flex;
	cursor: pointer;
	transition: transform 0.1s, left 0.3s;
	align-items: center;
    background: #CCc;
    border-radius: 5px;
    padding: 0px 5px 0px 5px;
	
	box-shadow: 2px 2px 6px 0px #000;
    background: #3d3044;
    color: #dac8c8;
	
	font-family: 'Bebas Neue';
}
.userOnline {
	color: #0a960a;
}

</style>
{#if 1|| !currentDevice.desktop() }
	<div class="btn" on:click={click} class:active={$resizeMode} >
		<Icon class="material-icons" style="" >aspect_ratio</Icon>
	</div>
{/if}


<script>

import { Icon } from '@smui/common'
import Slider from '@smui/slider'

import LineColorList from '@/components/LineColorList.svelte'

import { lineAlpha, lineWidth } from '@/store/settings.js'

import { resizeMode } from '@/store/misc.js'

import currentDevice from '@/lib/current-device'

const click = () => {
	$resizeMode = !$resizeMode
}

</script>

<style>
* {
	user-select: none;
}
.btn {
	position: fixed;
	right: 10px;
	bottom: 10px;
	display: flex;
	cursor: pointer;
	transition: all 0.3s;
}
.active {
	transform: scale(1.1);
	color: #1f72c7;
}
</style>
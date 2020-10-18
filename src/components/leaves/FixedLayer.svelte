{#if show }
	<div class="conatiner" transition:fade|local >
		<slot></slot>
	</div>
{/if}

<script>

import { fade } from 'svelte/transition'

export let show = false

</script>


<style>
.conatiner {
	position: fixed;
	width : 100%;
	height: 100%;
	display: flex;
	top: 0px;
	left: 0px;
	z-index: 1000;
	justify-content: center;
	align-items: center;
	background: #ccccccAA;
}

</style>
{#if loading }
	<div class="loading" transition:fade|local use:useResizeObserver={resize} >
		<Loading24x24 style="transform: scale({scale});" />
	</div>
{/if}

<script>

import { fade } from 'svelte/transition'
import Loading24x24 from '@/components/leaves/icons/Loading24x24.svelte'
import { useResizeObserver } from '@/helpers/useResizeObserver.js'

export let loading = false
export let loadingIconSize = 0.2

let scale = 1

function resize({width, height}) {
	scale = Math.max(width, height) / 24 * loadingIconSize
}

</script>

<style>
.loading {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	background: #CCCCCC50;
	display: flex;
    justify-content: center;
    align-items: center;
}
</style>
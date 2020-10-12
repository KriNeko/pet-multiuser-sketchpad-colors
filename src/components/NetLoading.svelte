{#if !$isConnected }
	<div class="background" transition:fade|local >
		<div class="lds-ripple"><div></div><div></div></div>
		<div class="icon" >
			<Icon class="material-icons icon" style="" >wifi</Icon>
		</div>
	</div>
{/if}


<script>

import { onMount } from 'svelte'
import { fade } from 'svelte/transition'
import { Icon } from '@smui/common'

import { isConnected } from '@/control/net.js'

</script>


<style>
.background {
	display: flex;
	background-color: rgba(0,0,0,.32);
	position: fixed;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
	z-index: 100;
}

.icon {
    position: absolute;
    color: #FFF;
    font-size: 80px;
	display: flex;
	animation: icon-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
	opacity: 0.2;
}

@keyframes icon-ripple {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.lds-ripple {
  display: inline-block;
  position: relative;
  width: 200px;
  height: 200px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid #fff;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}


</style>
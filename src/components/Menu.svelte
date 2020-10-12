	<!--
<div class="menu" > 
	<div>
		Line width {$lineWidth}px
		<div class="sliderWrapper">
			<Slider 
				bind:value={$lineWidth} 
				discrete
				min={1}
				max={10}
				step={1}
			/>
		</div>
	</div>
	<div>
		Line alpha {$lineAlpha}/255
		<div class="sliderWrapper">
			<Slider 
				bind:value={$lineAlpha} 
				discrete
				min={1}
				max={50}
				step={1}
			/>
		</div>
	</div>
</div>
	-->

<script>

import Slider from '@smui/slider'
import Button from '@smui/button'
import {Label, Icon} from '@smui/common';

import { localStorageWritable } from '@/helpers/localStorageWritable.js'
import { lineAlpha, lineWidth } from '@/store/settings.js'

</script>

<style>
* {
	user-select: none;
}

.menu {
	display: flex;
    flex-direction: column;
    width: 200px;
	position: fixed;
	top: 10px;
	left: 10px;
	border: 1px solid #e2c9c9;
	border-radius: 3px;
	padding: 10px;
}
.sliderWrapper {
    //height: 20px;
    display: flex;
    align-items: center;
}

.groupColor {
	display: flex;
    flex-wrap: wrap;
    column-gap: 2px;
    row-gap: 2px;
}
.itemColor {
	background: #F00;
	width: 15px;
	height: 15px;
	border-radius: 50%;
	cursor: pointer;
	transition: all 0.1s;
}
.itemColor.active {
	transform: scale(1.2);
}
.itemColor:hover {
	transform: scale(0.8);
}
</style>
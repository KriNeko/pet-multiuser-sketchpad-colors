<div class="container" >
	<div class="item" >
		<div class="icon" >
			<Icon class="material-icons" style="" >line_weight</Icon>
		</div>
		
		<div class="sliderWrapper" >
			<div style="min-width: 16px;" ></div>
			<div class="sliderWrapper2">
				<Slider 
					bind:value={$lineWidth} 
					discrete
					min={1}
					max={10}
					step={1}
				/>
			</div>
		</div>
	</div>

	<div class="item" >
		<div class="icon" >
			<Icon class="material-icons" style="" >opacity</Icon>
		</div>
		
		<div class="sliderWrapper" >
			<div style="min-width: 16px;" ></div>
			<div class="sliderWrapper2">
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
	
	<div style="height: 4px;" ></div>
	
	<div class="item" >
		<div class="lineColorListWrapper" >
			<LineColorList />
		</div>
	</div>
</div>
	
<script>

import { Icon } from '@smui/common'
import Slider from '@smui/slider'

import LineColorList from '@/components/LineColorList.svelte'

import { lineAlpha, lineWidth } from '@/store/settings.js'

</script>


<style>
* {
	user-select: none;
}
.container {
	position: fixed;
	bottom: 10px;
	left: 10px;
	
	display: flex;
    column-gap: 2px;
    row-gap: 2px;
	transition: all 1s;
	
    flex-direction: column;
}

.item {
	display: flex;
	align-items: center;
	height: 24px;
	position: relative;
}
.item:hover .sliderWrapper {
	width: 300px;
}
.sliderWrapper {
	display: flex;
	overflow: hidden;
	width: 0px;
	height: 100px;
	align-items: center;
	transition: width 0.3s;
}
.sliderWrapper2 {
	display: flex;
	align-items: center;
	width: 200px;	
	min-width: 200px;	
}
.icon {
	width: 24px; 
	height: 24px;
	cursor: pointer;
}
.lineColorListWrapper {
	position: absolute;
}
</style>
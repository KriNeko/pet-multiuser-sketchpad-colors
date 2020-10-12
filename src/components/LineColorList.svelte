<div class="groupColor" >
	{#each _lineColorList as color(color.color)}
		
		<div
			class="itemColor" 
			class:active={color.color === $lineColor} 
			on:click={() => $lineColor = color.color}
			style="
				z-index: {color.zIndex}; 
				left: {color.order * (lineIconWidth + lineIconMargin)}px; 
			"
		>
			<Icon class="material-icons" style="color: {color.color};" >invert_colors</Icon>
		</div>
	{/each}
</div>
		
<script>

import { Icon } from '@smui/common'

import { lineColor, lineColorList } from '@/store/settings.js'

let lineIconWidth = 24, lineIconMargin = 4
let _lineColorList = lineColorList.map(c => ({order: 0, color: c, zIndex: 0}))
function watchLineColor() {
	let order = 1;
	[..._lineColorList]
		.map(c => ( 
			c.order = c.color === $lineColor ? -1e9 : c.order,
			c 
		))
		.sort((l, r) => l.order - r.order)
		.map((c, i, a) => (
			c.order = i,
			c.zIndex = a.length - i
		))
	_lineColorList = _lineColorList
}
$: watchLineColor($lineColor)

</script>


<style>
* {
	user-select: none;
}
.groupColor {
	//position: fixed;
	//bottom: 10px;
	//left: 10px;
	position: relative;
	overflow: hidden;
	
	display: flex;
    column-gap: 2px;
    row-gap: 2px;
	transition: all 1s;
	width: 80px;
	height: 28px;
}
.groupColor:hover {
	width: 1000px;
}
.itemColor {
	position: absolute;
	display: flex;
	cursor: pointer;
	transition: transform 0.1s, left 0.3s;
}
.itemColor.active {
	transform: scale(1.2);
}
.itemColor.active:hover {
	transform: scale(1.2);
}
.itemColor:hover {
	transform: scale(1.1);
}
</style>
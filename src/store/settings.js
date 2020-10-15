
import { get, writable } from 'svelte/store'
import { localStorageWritable } from '@/helpers/localStorageWritable.js'
import { parseColorHEX } from '@/lib/webgl-render-points/helpers/utils.js'

export const lineColorList = [
	"#FF0000",
	"#00FF00",
	"#0000FF",
	"#00a1ff",
	"#d8ff00",
	"#141512",
	"#a0016f",
]

export const lineColor = localStorageWritable('settings/lineColor', lineColorList[0])
export const lineWidth = localStorageWritable('settings/lineWidth', 1)
export const lineAlpha = localStorageWritable('settings/lineAlpha', 10)

export const lineColorAlphaArray = writable([0, 0, 0, 0])
const updateLineColorAlphaArray = () =>
	lineColorAlphaArray.set(
		parseColorHEX( get(lineColor) + get(lineAlpha).toString(16).padStart(2, '0').match(/..$/)[0] )
	)

lineColor.subscribe(updateLineColorAlphaArray)
lineAlpha.subscribe(updateLineColorAlphaArray)



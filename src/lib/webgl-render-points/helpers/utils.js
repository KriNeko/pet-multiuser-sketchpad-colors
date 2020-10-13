
export const parseColorHEX = (hex) => {
	let [r, g, b, a = 255] = hex.replace(/^\#/, '').match(/../g).map(s => parseInt(s, 16))
	return [ r, g, b, a ].map(v => Math.min(0xFF, Math.max(0, v|0)))
}
export const parseNormalizeColorHEX = hex => 
	parseColorHEX(hex).map(v => v / 0xFF)

<div class="container" >
	{#each arr as rows}
		<div>
		{#each rows as cell}
			<div>{ cell }</div>
		{/each}
		</div>
	{/each}
</div>

<script>

export let maxNumRows = 20

let rows = 0
let map = {}
let arr = []

const normalizeCs = cs => {
	while( cs.length < rows )
		cs.push('')
}
export const addObj = obj => {
	Object
		.entries(obj)
		.map(([k, v]) => {
			const cs = map[k] = map[k] ?? []
			normalizeCs(cs)
			cs.push(v)
		})
	
	Object.entries(map).map(([k, cs]) => normalizeCs(cs))
	Object.entries(map).map(([k, cs]) => cs.splice(0, cs.length - maxNumRows))
	
	arr = Array(Object.keys(map).length).fill(0).map(v => [])
	const keys = Object.keys(map).sort()
	arr = [keys]
	const _list = map[keys[0]]
	_list.map((v , i) => {
		arr.push( keys.map(k => map[k][ _list.length - i - 1 ]) )
	})

	rows = map[keys[0]].length
	arr = arr
}


</script>

<style>
* {
    font-family: 'Bebas Neue';
	user-select: none;
	pointer-events: none;
}
.container {
	position: absolute;
	right: 20px;
	top: 20px;
	background: #04000acc;
	color: #AAA;
	display: flex;
	flex-direction: column;
	border-radius: 3px;
    box-shadow: 0 0 10px 2px black;
}
.container > div {
	display: flex;
		
}
.container > div > div {
	display: flex;
    justify-content: center;
    align-items: center;
	width: 40px;
}
</style>
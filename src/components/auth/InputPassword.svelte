
<Input 
	placeholder="Enter password" 
	bind:value={password}
	bind:valid
	bind:errors
	minNumChars=4 
	maxNumChars=12 
/>
		
<script>

import Input from '@/components/leaves/Input.svelte'

export let password = ''
export let valid = false
export let errors = []

</script>
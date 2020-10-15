<button class:disabled {disabled} on:click >
	<slot/>
</button>

<script>

export let disabled = false

</script>

<style>
* {
    font-family: 'Bebas Neue';
}
button {
	outline: none;
    border: none;
    background: none;
    background: #3fceef;
    padding: 5px 10px;
    display: flex;
	cursor: pointer;
	
	box-shadow: 0 0 4px 0px black;
    border-radius: 3px;	
	
	transition: all 0.1s;
}
button:hover {
	box-shadow: 0 0 6px 0px black;
}
button:active {
	transform: scale(0.95);
}
button.disabled {
    opacity: 0.5;
    background: #ccc;
	box-shadow: 0 0 4px 0px black;
	transform: scale(1);
}
</style>
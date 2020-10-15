<div class="container" >
	{#if isInputFocus || localValue }
		<div style="height: 20px;" transition:slide|local={{duration: 100}} ></div>
	{/if}
	<div class="inputWrapper" >
		<input
			bind:value={localValue}
			on:focus={onfocus}
			on:blur={onblur}
		/>
		<div class="placeholder" class:placeholderTop={isInputFocus || localValue} >{placeholder}</div>
		{#if isInputFocus || localValue }
			<div class="lettersLeft" transition:fade|local={{duration: 100}} >
				<span class:lettersLeftLenInvalid={localValue.length < minNumChars || localValue.length > maxNumChars} >{localValue.length}</span>/{maxNumChars}
			</div>
		{/if}
	</div>
	<div class="messagesContainer" >
		{#if status }
			<div class="messagesItem messageStatus" transition:slide|local >
				{#if status.loading }
					<div class="abs00 flex" >
						<Loading24x24 /> 
					</div>
				{/if}
				
				{#if status.error }
					<span class="error abs00 flex" transition:fade|local >{ status.error }</span>
				{/if}
				
				{#if status.success }
					<span class="success abs00 flex" transition:fade|local >{ status.success }</span>
				{/if}
			</div>
		{/if}

		{#if invalidChars.length }
			<div transition:slide|local class="messagesItem messageInvalidChars" >
				Bad chars
				<div style="width: 4px;" ></div>
				<div class="invalidCharsGroup" >
					{#each invalidChars as char}
						<span class="messageInvalidCharsChar" >{ char }</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if (isInputFocus || localValue.length) && localValue.length < minNumChars }
			<div transition:slide|local class="messagesItem messageInvalidChars" >
				Small input length, need more than {minNumChars}
			</div>
		{/if}
		
		{#if (isInputFocus || localValue.length) && localValue.length > maxNumChars }
			<div transition:slide|local class="messagesItem messageInvalidChars" >
				Long input length, need less than {maxNumChars}
			</div>
		{/if}

		{#each errors as error}
			<div transition:slide|local class="messagesItem messageInvalidChars" >
				{ error }
			</div>
		{/each}

	</div>
</div>

<script>

import { onDestroy } from 'svelte'
import { fade, slide } from 'svelte/transition'
import { setTimeoutOnceInTime } from '@/helpers/setTimeoutOnceInTime.js'

import Loading24x24 from './icons/Loading24x24.svelte'

let isInputFocus = false
let localValue = ''
export let value = ''
export let placeholder = ''

export let minNumChars = 3
export let maxNumChars = 10
export let valid = false

let invalidChars = []
let invalidLength = ''

/*
status = { error: 'Error text' }
status = { success: 'Success text' }
status = { loading: true }
*/
export let status = null

export let errors = []

export let filter = value => {
	const invalidChars = []
	value = value
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, m => (invalidChars.push(m), ""))
	return { value, invalidChars }
}

function onfocus() {
	isInputFocus = true
}
function onblur() {
	isInputFocus = false
}

const setTimeoutOnceInTimeForInvalidChars = setTimeoutOnceInTime(onDestroy)(1e3)
const setTimeoutOnceInTimeForErrors = setTimeoutOnceInTime(onDestroy)(5e3)

function watchValue(val) {
	const result = filter(val)
	val = result.value
	if ( maxNumChars && val.length > maxNumChars )
		val = val.slice(0, maxNumChars)
	invalidChars = [...result.invalidChars.reverse(), ...invalidChars].slice(0, 10)
	
	value = localValue = val
	valid = val.length >= minNumChars && value.length <= maxNumChars
}
$: watchValue(localValue)
$: watchValue(value)

$: invalidChars, setTimeoutOnceInTimeForInvalidChars(() => invalidChars = [])
$: errors, setTimeoutOnceInTimeForErrors(() => errors = [])


globalThis.setSL = v => statusLoading = v



</script>

<style>

* {
    font-family: 'Bebas Neue';
}

.container {
	position: relative;
	display: flex;
	flex-direction: column;
	border: 1px solid #484848;
    border-radius: 5px;
	border: 1px solid #DADADA;
	background: #F9F9FA;
	overflow: hidden;
}
.inputWrapper {
	position: relative;
	display: flex;
	
}
input {
    display: flex;
    font-size: 20px;
    font-family: 'Bebas Neue';
    padding: 2px 10px;
    border: none;
    outline: none;
	width: 100%;
    background: none;
}
.placeholder {
	position: absolute;

    font-size: 20px;
    font-family: 'Bebas Neue';
	
	left: 10px;
	top: 2px;
	transform-origin: left;
	
	transition: all 0.1s;
	pointer-events: none;
	
	opacity: 0.5;
}
.placeholderTop {
	transform: scale(0.8);
    top: -18px;
}

.lettersLeft {
	position: absolute;
	right: 10px;
    top: -18px;
    font-size: 20px;
    font-family: 'Bebas Neue';
	transform: scale(0.8);
	opacity: 0.5;
	transform-origin: right;
}
.lettersLeftLenInvalid {
	color: #F00;
}

.messagesContainer {
	display: flex;
	flex-direction: column;
    padding-left: 10px;
	white-space: nowrap;
	font-size: 12px;
}
.messagesItem {
	display: flex;
    align-items: center;
}

.messageInvalidChars {
	color: #960606;
	display: flex;
}

.invalidCharsGroup {
	display: flex;
	column-gap: 2px;
}
.messageInvalidCharsChar {
	background: #ccc;
    padding: 0px 2px;
    background: rgb(204 204 204 / 0.5);
    border-radius: 2px;
}

.messageStatus {
	position: relative;
	height: 24px;
}

.error {
	color: #960606;
}
.success {
	color: #0F0;
}
.abs00 {
	position: absolute; 
	top: 0px; 
	left: 0px; 
}
.flex {
	display: flex;
	height: 100%;
    align-items: center;
}
</style>
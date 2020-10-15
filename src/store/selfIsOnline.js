
import { writable } from 'svelte/store'

const getIsOnline = () => document.visibilityState === 'visible'

export const selfIsOnline = writable( getIsOnline() )

document.addEventListener("visibilitychange", () => selfIsOnline.set( getIsOnline() ))
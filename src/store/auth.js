
import { writable } from 'svelte/store'
import { localStorageWritable } from '@/helpers/localStorageWritable.js'

export const id      = localStorageWritable('user/id', '')
export const login   = localStorageWritable('user/login', '')
export const session = localStorageWritable('user/session', '')
export const isAuthorized = writable( false )

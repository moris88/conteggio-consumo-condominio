import { describe, expect, it } from 'vitest'

import { cn } from '@/utils/cn'

describe('cn utility', () => {
	it('combina classi semplici', () => {
		expect(cn('foo', 'bar')).toBe('foo bar')
	})

	it('rimuove classi duplicate/conflittuali con tailwind-merge', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4')
		expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
	})

	it('gestisce classi condizionali con clsx', () => {
		expect(cn('base', true && 'active')).toBe('base active')
		expect(cn('base', false && 'active')).toBe('base')
	})

	it('gestisce array di classi', () => {
		expect(cn(['foo', 'bar'])).toBe('foo bar')
	})

	it('gestisce oggetti condizionali', () => {
		expect(cn({ foo: true, bar: false })).toBe('foo')
		expect(cn({ foo: true, bar: true })).toBe('foo bar')
	})

	it('ignora valori null/undefined/false', () => {
		expect(cn('foo', null, undefined, false)).toBe('foo')
	})

	it('gestisce stringhe vuote', () => {
		expect(cn('', 'foo')).toBe('foo')
		expect(cn()).toBe('')
	})

	it('risolve correttamente i conflitti Tailwind comuni', () => {
		expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500')
		expect(cn('px-2 py-2', 'p-4')).toBe('p-4')
		expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe(
			'hover:bg-blue-500',
		)
	})

	it('combina classi complesse', () => {
		const result = cn(
			'flex items-center',
			'rounded-lg',
			{ 'bg-blue-600': true, 'bg-red-600': false },
			'text-white',
		)
		expect(result).toBe('flex items-center rounded-lg bg-blue-600 text-white')
	})
})

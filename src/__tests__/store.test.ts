import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '@/store/useAppStore'

// Mock crypto.randomUUID for consistent IDs in tests
if (!global.crypto) {
	;(global as any).crypto = {
		randomUUID: () => `test-uuid-${Math.random().toString(36).substring(7)}`,
	}
}

describe('useAppStore', () => {
	beforeEach(() => {
		act(() => {
			useAppStore.getState().reset()
		})
	})

	it('inizializza con lo stato di default', () => {
		const state = useAppStore.getState()
		expect(state.condomini).toEqual([])
		expect(state.activeStep).toBe('condomini')
		expect(state.bolletta.consumoTotale).toBe(0)
	})

	it('aggiunge un condomino', () => {
		const { result } = renderHook(() => useAppStore())

		act(() => {
			result.current.addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		expect(result.current.condomini).toHaveLength(1)
		expect(result.current.condomini[0]).toMatchObject({
			nome: 'Mario',
			cognome: 'Rossi',
			appartamento: 'A1',
			tipo: 'proprietario-residente',
			letturaAttuale: 0,
			letturaPrecedente: 0,
		})
		expect(result.current.condomini[0].id).toBeDefined()
	})

	it('aggiorna un condomino', () => {
		const { result } = renderHook(() => useAppStore())

		act(() => {
			result.current.addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		const id = result.current.condomini[0].id

		act(() => {
			result.current.updateCondomino(id, { letturaAttuale: 100 })
		})

		expect(result.current.condomini[0].letturaAttuale).toBe(100)
	})

	it('elimina un condomino', () => {
		const { result } = renderHook(() => useAppStore())

		act(() => {
			result.current.addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		const id = result.current.condomini[0].id

		act(() => {
			result.current.deleteCondomino(id)
		})

		expect(result.current.condomini).toHaveLength(0)
	})

	it('imposta i dati della bolletta', () => {
		const { result } = renderHook(() => useAppStore())

		const nuovaBolletta = {
			...result.current.bolletta,
			consumoTotale: 500,
			quotaFissa: 50,
		}

		act(() => {
			result.current.setBolletta(nuovaBolletta)
		})

		expect(result.current.bolletta.consumoTotale).toBe(500)
		expect(result.current.bolletta.quotaFissa).toBe(50)
	})

	it('cambia lo step attivo', () => {
		const { result } = renderHook(() => useAppStore())

		act(() => {
			result.current.setActiveStep('bolletta')
		})

		expect(result.current.activeStep).toBe('bolletta')
	})

	it('resetta lo stato', () => {
		const { result } = renderHook(() => useAppStore())

		act(() => {
			result.current.addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			result.current.setActiveStep('bolletta')
			result.current.reset()
		})

		expect(result.current.condomini).toHaveLength(0)
		expect(result.current.activeStep).toBe('condomini')
	})
})

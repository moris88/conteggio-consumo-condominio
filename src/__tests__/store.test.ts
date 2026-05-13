import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '@/store/useAppStore'

// Mock crypto.randomUUID for consistent IDs in tests
if (!globalThis.crypto) {
	;(globalThis as any).crypto = {
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
		expect(state.condominiAcqua).toEqual([])
		expect(state.condominiLuce).toEqual([])
		expect(state.activeStep).toBe('condomini')
		expect(state.bolletta.consumoTotale).toBe(0)
	})

	it('aggiunge un condomino alla lista corretta in base al tipo', () => {
		const store = useAppStore.getState()

		// Acqua (default)
		act(() => {
			store.addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		expect(useAppStore.getState().condominiAcqua).toHaveLength(1)
		expect(useAppStore.getState().condominiLuce).toHaveLength(0)

		// Luce
		act(() => {
			useAppStore.getState().setType('luce')
			useAppStore.getState().addCondomino({
				nome: 'Luigi',
				cognome: 'Verdi',
				appartamento: 'B2',
				tipo: 'inquilino',
			})
		})

		expect(useAppStore.getState().condominiAcqua).toHaveLength(1)
		expect(useAppStore.getState().condominiLuce).toHaveLength(1)
		expect(useAppStore.getState().condominiLuce[0].nome).toBe('Luigi')
	})

	it('aggiorna un condomino nella lista corretta', () => {
		act(() => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		const id = useAppStore.getState().condominiAcqua[0].id

		act(() => {
			useAppStore.getState().updateCondomino(id, { letturaAttuale: 100 })
		})

		expect(useAppStore.getState().condominiAcqua[0].letturaAttuale).toBe(100)
	})

	it('elimina un condomino dalla lista corretta', () => {
		act(() => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		const id = useAppStore.getState().condominiAcqua[0].id

		act(() => {
			useAppStore.getState().deleteCondomino(id)
		})

		expect(useAppStore.getState().condominiAcqua).toHaveLength(0)
	})

	it('imposta i dati della bolletta', () => {
		const nuovaBolletta = {
			...useAppStore.getState().bolletta,
			consumoTotale: 500,
			quotaFissa: 50,
		}

		act(() => {
			useAppStore.getState().setBolletta(nuovaBolletta)
		})

		expect(useAppStore.getState().bolletta.consumoTotale).toBe(500)
		expect(useAppStore.getState().bolletta.quotaFissa).toBe(50)
	})

	it('cambia lo step attivo', () => {
		act(() => {
			useAppStore.getState().setActiveStep('bolletta')
		})

		expect(useAppStore.getState().activeStep).toBe('bolletta')
	})

	it('resetta lo stato', () => {
		act(() => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			useAppStore.getState().setType('luce')
			useAppStore.getState().addCondomino({
				nome: 'Luigi',
				cognome: 'Verdi',
				appartamento: 'B2',
				tipo: 'inquilino',
			})
			useAppStore.getState().setActiveStep('bolletta')
			useAppStore.getState().reset()
		})

		expect(useAppStore.getState().condominiAcqua).toHaveLength(0)
		expect(useAppStore.getState().condominiLuce).toHaveLength(0)
		expect(useAppStore.getState().activeStep).toBe('condomini')
	})
})

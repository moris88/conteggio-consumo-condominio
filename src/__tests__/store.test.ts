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
			useAppStore.getState().svuotaStorico()
		})
	})

	it('inizializza con lo stato di default', () => {
		const state = useAppStore.getState()
		expect(state.condominiAcqua).toEqual([])
		expect(state.condominiLuce).toEqual([])
		expect(state.activeStep).toBe('condomini')
		expect(state.bolletta.consumoTotale).toBe(0)
		expect(state.storico).toEqual([])
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

	describe('gestione storico', () => {
		it('salva e recupera dallo storico', () => {
			act(() => {
				useAppStore.getState().setBolletta({
					...useAppStore.getState().bolletta,
					numeroBolletta: 'TEST-123',
				})
				useAppStore.getState().salvaInStorico('Nota test')
			})

			const storico = useAppStore.getState().storico
			expect(storico).toHaveLength(1)
			expect(storico[0].note).toBe('Nota test')
			expect((storico[0].bolletta as any).numeroBolletta).toBe('TEST-123')

			act(() => {
				useAppStore.getState().reset()
				useAppStore.getState().caricaDaStorico(storico[0].id)
			})

			expect(useAppStore.getState().bolletta.numeroBolletta).toBe('TEST-123')
			expect(useAppStore.getState().activeStep).toBe('risultati')
		})

		it('aggiorna un elemento esistente nello storico (upsert)', () => {
			act(() => {
				const store = useAppStore.getState()
				store.setBolletta({ ...store.bolletta, numeroBolletta: '123' })
				store.salvaInStorico('Nota 1')
			})

			expect(useAppStore.getState().storico).toHaveLength(1)
			expect(useAppStore.getState().storico[0].note).toBe('Nota 1')

			act(() => {
				const store = useAppStore.getState()
				store.salvaInStorico('Nota 2')
			})

			expect(useAppStore.getState().storico).toHaveLength(1)
			expect(useAppStore.getState().storico[0].note).toBe('Nota 2')
		})

		it('elimina un elemento dallo storico', () => {
			act(() => {
				const store = useAppStore.getState()
				store.setBolletta({ ...store.bolletta, numeroBolletta: 'DEL-123' })
				store.salvaInStorico()
			})
			const id = useAppStore.getState().storico[0].id

			act(() => {
				useAppStore.getState().eliminaDaStorico(id)
			})

			expect(useAppStore.getState().storico).toHaveLength(0)
		})

		it('aggiorna la nota di un elemento dello storico', () => {
			act(() => {
				const store = useAppStore.getState()
				store.setBolletta({ ...store.bolletta, numeroBolletta: 'NOTE-123' })
				store.salvaInStorico('Prima nota')
			})
			const id = useAppStore.getState().storico[0].id

			act(() => {
				useAppStore.getState().updateNotaStorico(id, 'Seconda nota')
			})

			expect(useAppStore.getState().storico[0].note).toBe('Seconda nota')
		})

		it("non carica nulla se l'id non esiste", () => {
			const initialStep = useAppStore.getState().activeStep
			act(() => {
				useAppStore.getState().caricaDaStorico('non-existent-id')
			})
			expect(useAppStore.getState().activeStep).toBe(initialStep)
		})

		it('carica una bolletta luce dallo storico', () => {
			act(() => {
				useAppStore.getState().setType('luce')
				useAppStore.getState().setBollettaLuce({
					...useAppStore.getState().bollettaLuce,
					numeroBolletta: 'LUCE-456',
				})
				useAppStore.getState().salvaInStorico('Luce test')
			})

			const id = useAppStore.getState().storico[0].id

			act(() => {
				useAppStore.getState().reset()
				useAppStore.getState().caricaDaStorico(id)
			})

			expect(useAppStore.getState().type).toBe('luce')
			expect(useAppStore.getState().bollettaLuce.numeroBolletta).toBe(
				'LUCE-456',
			)
			expect(useAppStore.getState().activeStep).toBe('risultati')
		})
	})

	it('importa i dati correttamente', () => {
		const datiDaImportare = {
			type: 'luce' as const,
			condominiLuce: [
				{
					id: '1',
					nome: 'Luigi',
					cognome: 'Verdi',
					appartamento: 'B2',
					tipo: 'inquilino' as const,
					letturaAttuale: 0,
					letturaPrecedente: 0,
				},
			],
		}

		act(() => {
			useAppStore.getState().importaDati(datiDaImportare)
		})

		expect(useAppStore.getState().type).toBe('luce')
		expect(useAppStore.getState().condominiLuce).toHaveLength(1)
		expect(useAppStore.getState().condominiLuce[0].nome).toBe('Luigi')
	})
})

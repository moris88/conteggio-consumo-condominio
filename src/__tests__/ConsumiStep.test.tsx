import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ConsumiStep } from '@/components/ConsumiStep'
import { useAppStore } from '@/store/useAppStore'

describe('ConsumiStep', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
	})

	it('mostra avviso se non ci sono condomini', () => {
		render(<ConsumiStep />)
		expect(screen.getByText(/Nessun condomino/i)).toBeDefined()
	})

	it('permette di inserire le letture', () => {
		const store = useAppStore.getState()
		store.addCondomino({
			nome: 'M',
			cognome: 'R',
			appartamento: '1',
			tipo: 'proprietario-residente',
		})
		store.setBolletta({ ...store.bolletta, consumoTotale: 100 })

		render(<ConsumiStep />)

		const precInput = screen.getByLabelText('Lettura precedente')
		const attInput = screen.getByLabelText(/Lettura attuale/i)

		fireEvent.change(precInput, { target: { value: '50' } })
		fireEvent.change(attInput, { target: { value: '60' } })

		expect(useAppStore.getState().condominiAcqua[0].letturaPrecedente).toBe(50)
		expect(useAppStore.getState().condominiAcqua[0].letturaAttuale).toBe(60)
		expect(screen.getByText('10 mc')).toBeDefined()
	})

	it('permette di tornare allo step precedente', () => {
		act(() => {
			const store = useAppStore.getState()
			store.addCondomino({
				nome: 'A',
				cognome: 'B',
				appartamento: '1',
				tipo: 'proprietario-residente',
			})
			store.setBolletta({ ...store.bolletta, consumoTotale: 100 })
		})

		render(<ConsumiStep />)

		fireEvent.click(screen.getByText('← Bolletta'))
		expect(useAppStore.getState().activeStep).toBe('bolletta')
	})

	it('permette di procedere allo step successivo', () => {
		act(() => {
			const store = useAppStore.getState()
			store.addCondomino({
				nome: 'A',
				cognome: 'B',
				appartamento: '1',
				tipo: 'proprietario-residente',
			})
			store.setBolletta({ ...store.bolletta, consumoTotale: 100 })
			store.setActiveStep('consumi')
		})

		render(<ConsumiStep />)

		fireEvent.click(screen.getByText('Calcola Risultati →'))
		expect(useAppStore.getState().activeStep).toBe('risultati')
	})

	it('aggiorna le soglie e quote minime', () => {
		act(() => {
			const store = useAppStore.getState()
			store.addCondomino({
				nome: 'A',
				cognome: 'B',
				appartamento: '1',
				tipo: 'proprietario-residente',
			})
		})

		render(<ConsumiStep />)

		const select = screen.getByLabelText(/Soglia discrepanza/i)
		fireEvent.change(select, { target: { value: '20' } })

		expect(useAppStore.getState().bolletta.sogliaDiscrepanza).toBe(20)

		const quotaMin = screen.getByLabelText(/Quota minima tariffa agevolata/i)
		fireEvent.change(quotaMin, { target: { value: '15' } })

		expect(useAppStore.getState().bolletta.tariffaAgevolataMin).toBe(15)
	})
})

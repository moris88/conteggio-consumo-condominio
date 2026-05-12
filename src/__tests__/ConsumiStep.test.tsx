import { fireEvent, render, screen } from '@testing-library/react'
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

		expect(useAppStore.getState().condomini[0].letturaPrecedente).toBe(50)
		expect(useAppStore.getState().condomini[0].letturaAttuale).toBe(60)
		expect(screen.getByText('10 mc')).toBeDefined()
	})
})

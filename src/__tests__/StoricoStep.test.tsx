import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StoricoStep } from '@/components/StoricoStep'
import { useAppStore } from '@/store/useAppStore'

describe('StoricoStep', () => {
	beforeEach(() => {
		act(() => {
			useAppStore.getState().reset()
			useAppStore.getState().svuotaStorico()
		})
		// Mock prompt and confirm
		vi.stubGlobal(
			'confirm',
			vi.fn(() => true),
		)
		vi.stubGlobal(
			'prompt',
			vi.fn(() => 'Nuova nota'),
		)
	})

	it('visualizza un messaggio quando lo storico è vuoto', () => {
		render(<StoricoStep />)
		expect(screen.getByText(/Nessuna bolletta salvata/i)).toBeDefined()
	})

	it('elenca le bollette salvate nello storico', () => {
		act(() => {
			const store = useAppStore.getState()
			store.setBolletta({ ...store.bolletta, numeroBolletta: 'LIST-123' })
			store.salvaInStorico('Nota test')
		})

		render(<StoricoStep />)

		expect(screen.getByText(/Nota test/i)).toBeDefined()
		expect(screen.getByText(/Bolletta n. /i)).toBeDefined()
	})

	it('permette di caricare una bolletta dallo storico', () => {
		act(() => {
			const store = useAppStore.getState()
			store.setBolletta({ ...store.bolletta, numeroBolletta: '123' })
			store.salvaInStorico('Nota 123')
		})

		render(<StoricoStep />)

		const visualizzaBtn = screen.getAllByText(/Visualizza/i)[0]
		fireEvent.click(visualizzaBtn)

		expect(useAppStore.getState().bolletta.numeroBolletta).toBe('123')
		expect(useAppStore.getState().activeStep).toBe('risultati')
	})

	it('permette di eliminare una bolletta dallo storico', () => {
		act(() => {
			const store = useAppStore.getState()
			store.setBolletta({ ...store.bolletta, numeroBolletta: 'DEL-123' })
			store.salvaInStorico('Da eliminare')
		})

		render(<StoricoStep />)

		const trashBtn = screen.getByLabelText('Elimina')

		act(() => {
			fireEvent.click(trashBtn)
		})

		expect(useAppStore.getState().storico.length).toBe(0)
	})

	it('permette di modificare la nota di una bolletta', () => {
		act(() => {
			const store = useAppStore.getState()
			store.setBolletta({ ...store.bolletta, numeroBolletta: 'NOTE-123' })
			store.salvaInStorico('Nota originale')
		})

		render(<StoricoStep />)

		const notaElement = screen.getByText('Nota originale')
		fireEvent.click(notaElement)

		const input = screen.getByPlaceholderText(/Aggiungi una nota/i)
		fireEvent.change(input, { target: { value: 'Nota modificata' } })

		fireEvent.click(screen.getByText('Salva'))

		expect(useAppStore.getState().storico[0].note).toBe('Nota modificata')
	})

	it('esporta i dati in formato JSON', () => {
		const link = {
			setAttribute: vi.fn(),
			click: vi.fn(),
		}
		const originalCreateElement = document.createElement
		const spy = vi
			.spyOn(document, 'createElement')
			.mockImplementation((tagName) => {
				if (tagName === 'a') return link as any
				return originalCreateElement.call(document, tagName)
			})

		render(<StoricoStep />)
		fireEvent.click(screen.getByText(/Esporta tutto/i))

		expect(spy).toHaveBeenCalledWith('a')
		expect(link.click).toHaveBeenCalled()

		spy.mockRestore()
	})
})

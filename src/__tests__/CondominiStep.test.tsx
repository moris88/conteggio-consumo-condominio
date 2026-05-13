import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CondominiStep } from '@/components/CondominiStep'
import { useAppStore } from '@/store/useAppStore'

describe('CondominiStep', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
	})

	it("renderizza il form e permette l'aggiunta di un condomino", async () => {
		render(<CondominiStep />)

		expect(screen.getByText('Aggiungi Condomino')).toBeDefined()

		const cognomeInput = screen.getByLabelText('Cognome *')
		const appartamentoInput = screen.getByLabelText('Appartamento *')
		const addBtn = screen.getByText('Aggiungi')

		fireEvent.change(cognomeInput, { target: { value: 'Rossi' } })
		fireEvent.change(appartamentoInput, { target: { value: 'A1' } })

		fireEvent.click(addBtn)

		expect(screen.getByText('Rossi')).toBeDefined()
		expect(screen.getByText('A1')).toBeDefined()
		expect(useAppStore.getState().condomini).toHaveLength(1)
	})

	it('permette di eliminare un condomino', async () => {
		await act(async () => {
			useAppStore.getState().addCondomino({
				nome: 'M',
				cognome: 'R',
				appartamento: '1',
				tipo: 'proprietario-residente',
			})
		})

		render(<CondominiStep />)

		const deleteBtn = screen.getByRole('button', { name: /Elimina/i })
		await act(async () => {
			fireEvent.click(deleteBtn)
		})

		// Clicca elimina nel modal di conferma
		const confirmDeleteBtn = screen
			.getAllByRole('button', { name: /Elimina/i })
			.find(
				(btn) =>
					btn.classList.contains('bg-red-600') || btn.textContent === 'Elimina',
			)
		if (confirmDeleteBtn) {
			await act(async () => {
				fireEvent.click(confirmDeleteBtn)
			})
		}

		expect(useAppStore.getState().condomini).toHaveLength(0)
	})

	it('permette di iniziare la modifica di un condomino', async () => {
		await act(async () => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		render(<CondominiStep />)

		const editBtn = screen.getByRole('button', { name: /Modifica/i })
		await act(async () => {
			fireEvent.click(editBtn)
		})

		// Il modal ha label "Cognome" senza asterisco
		expect(screen.getByLabelText('Cognome')).toHaveValue('Rossi')
		expect(screen.getByText('Annulla')).toBeDefined()
	})

	it('esporta i condomini in JSON', async () => {
		await act(async () => {
			useAppStore.getState().addCondomino({
				nome: 'A',
				cognome: 'B',
				appartamento: '1',
				tipo: 'proprietario-residente',
			})
		})

		const createObjectURLMock = vi.fn(() => 'blob-url')
		globalThis.URL.createObjectURL = createObjectURLMock
		globalThis.URL.revokeObjectURL = vi.fn()

		const link = { click: vi.fn(), href: '', download: '' }
		const originalCreateElement = document.createElement
		vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
			if (tagName === 'a') return link as any
			return originalCreateElement.call(document, tagName)
		})

		render(<CondominiStep />)

		fireEvent.click(screen.getByText('Esporta'))

		expect(link.download).toBe('condomini.json')
	})

	it('permette di procedere allo step successivo', () => {
		const store = useAppStore.getState()
		store.addCondomino({
			nome: 'A',
			cognome: 'B',
			appartamento: '1',
			tipo: 'proprietario-residente',
		})

		render(<CondominiStep />)

		fireEvent.click(screen.getByText('Continua → Bolletta'))
		expect(useAppStore.getState().activeStep).toBe('bolletta')
	})

	it('importa i condomini da JSON', async () => {
		const mockData = [
			{
				id: '1',
				nome: 'M',
				cognome: 'R',
				appartamento: '1',
				tipo: 'proprietario-residente',
				letturaAttuale: 0,
				letturaPrecedente: 0,
			},
		]
		const file = new File([JSON.stringify(mockData)], 'condomini.json', {
			type: 'application/json',
		})

		render(<CondominiStep />)

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement
		fireEvent.change(input, { target: { files: [file] } })

		await vi.waitFor(() =>
			expect(useAppStore.getState().condomini).toHaveLength(1),
		)
	})
})

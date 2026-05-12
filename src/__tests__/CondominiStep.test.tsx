import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
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

	it('mostra errori di validazione', () => {
		render(<CondominiStep />)
		const addBtn = screen.getByText('Aggiungi')

		fireEvent.click(addBtn)

		expect(screen.getAllByText('Campo obbligatorio')).toHaveLength(2)
	})
})

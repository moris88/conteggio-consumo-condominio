import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { BollettaStep } from '@/components/BollettaStep'
import { useAppStore } from '@/store/useAppStore'

describe('BollettaStep', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
	})

	it('permette di inserire i dati della bolletta e salvare', () => {
		render(<BollettaStep />)

		const consumoInput = screen.getByLabelText(/Consumo totale dichiarato/i)
		const saveBtn = screen.getByText('Salva bolletta')

		fireEvent.change(consumoInput, { target: { value: '100' } })
		fireEvent.click(saveBtn)

		expect(
			screen.getByText('Dati bolletta salvati correttamente.'),
		).toBeDefined()
		expect(useAppStore.getState().bolletta.consumoTotale).toBe(100)
	})

	it('abilita il pulsante continua solo dopo il salvataggio', () => {
		render(<BollettaStep />)
		expect(screen.queryByText('Continua → Consumi')).toBeNull()

		const consumoInput = screen.getByLabelText(/Consumo totale dichiarato/i)
		fireEvent.change(consumoInput, { target: { value: '100' } })
		fireEvent.click(screen.getByText('Salva bolletta'))

		expect(screen.getByText('Continua → Consumi')).toBeDefined()
	})
})

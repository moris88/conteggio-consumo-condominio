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

	it('aggiorna correttamente tutti i campi numerici', () => {
		render(<BollettaStep />)

		const fields = [
			{
				label: /Consumo totale dichiarato/i,
				key: 'consumoTotale',
				value: '150',
			},
			{ label: /Quota fissa/i, key: 'quotaFissa', value: '25.5' },
			{ label: /Tariffa agevolata/i, key: 'tariffaAgevolata', value: '40' },
			{ label: /1° Fascia/i, key: 'eccedenzaFascia1', value: '10' },
			{ label: /Fogna/i, key: 'quotaFogna', value: '15' },
			{ label: /Depurazione/i, key: 'quotaDepurazione', value: '20' },
			{ label: /IVA/i, key: 'iva', value: '10' },
		]

		for (const field of fields) {
			const input = screen.getByLabelText(field.label)
			fireEvent.change(input, { target: { value: field.value } })
		}

		fireEvent.click(screen.getByText('Salva bolletta'))

		const bolletta = useAppStore.getState().bolletta
		expect(bolletta.consumoTotale).toBe(150)
		expect(bolletta.quotaFissa).toBe(25.5)
		expect(bolletta.tariffaAgevolata).toBe(40)
		expect(bolletta.eccedenzaFascia1).toBe(10)
		expect(bolletta.quotaFogna).toBe(15)
		expect(bolletta.quotaDepurazione).toBe(20)
		expect(bolletta.iva).toBe(10)
	})

	it('azzera i dati della bolletta', () => {
		render(<BollettaStep />)
		const consumoInput = screen.getByLabelText(/Consumo totale dichiarato/i)
		fireEvent.change(consumoInput, { target: { value: '100' } })

		fireEvent.click(screen.getByText('Azzera dati bolletta'))

		expect(consumoInput).toHaveValue(null) // NumberInput renders 0 as empty string
	})

	it('permette di tornare allo step precedente', () => {
		render(<BollettaStep />)
		fireEvent.click(screen.getByText('← Condomini'))
		expect(useAppStore.getState().activeStep).toBe('condomini')
	})

	it('permette di procedere allo step successivo dopo il salvataggio', () => {
		render(<BollettaStep />)
		const consumoInput = screen.getByLabelText(/Consumo totale dichiarato/i)
		fireEvent.change(consumoInput, { target: { value: '100' } })
		fireEvent.click(screen.getByText('Salva bolletta'))

		fireEvent.click(screen.getByText('Continua → Consumi'))
		expect(useAppStore.getState().activeStep).toBe('consumi')
	})
})

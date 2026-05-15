import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { BollettaLuceStep } from '@/components/BollettaLuceStep'
import { useAppStore } from '@/store/useAppStore'

describe('BollettaLuceStep', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
		useAppStore.getState().setType('luce')
	})

	it('renderizza i campi principali', () => {
		render(<BollettaLuceStep />)
		expect(screen.getByText('Periodo e Dati Fattura')).toBeDefined()
		expect(screen.getByText('Dati Economici')).toBeDefined()
		expect(screen.getByLabelText('Importo Totale Bolletta')).toBeDefined()
		expect(screen.getByLabelText('Spese Postali / Commissioni')).toBeDefined()
		expect(screen.getByLabelText('Spese Gestione / Cancelleria')).toBeDefined()
		expect(screen.getByLabelText('Rettifica / Acconti')).toBeDefined()
	})

	it('aggiorna totaleBolletta allo store', () => {
		render(<BollettaLuceStep />)
		const input = screen.getByLabelText('Importo Totale Bolletta')
		fireEvent.change(input, { target: { value: '250' } })
		expect(useAppStore.getState().bollettaLuce.totaleBolletta).toBe(250)
	})

	it('aggiorna spesePostali allo store', () => {
		render(<BollettaLuceStep />)
		const input = screen.getByLabelText('Spese Postali / Commissioni')
		fireEvent.change(input, { target: { value: '5.5' } })
		expect(useAppStore.getState().bollettaLuce.spesePostali).toBe(5.5)
	})

	it('aggiorna speseGestione allo store', () => {
		render(<BollettaLuceStep />)
		const input = screen.getByLabelText('Spese Gestione / Cancelleria')
		fireEvent.change(input, { target: { value: '3' } })
		expect(useAppStore.getState().bollettaLuce.speseGestione).toBe(3)
	})

	it('aggiorna rettificaAcconti allo store', () => {
		render(<BollettaLuceStep />)
		const input = screen.getByLabelText('Rettifica / Acconti')
		fireEvent.change(input, { target: { value: '-20' } })
		expect(useAppStore.getState().bollettaLuce.rettificaAcconti).toBe(-20)
	})

	it('aggiorna numeroBolletta allo store', () => {
		render(<BollettaLuceStep />)
		const input = screen.getByLabelText('Numero Bolletta')
		fireEvent.change(input, { target: { value: 'LU-2025-01' } })
		expect(useAppStore.getState().bollettaLuce.numeroBolletta).toBe(
			'LU-2025-01',
		)
	})

	it('pulsante "Continua" è disabilitato se totaleBolletta = 0 o numeroBolletta vuoto', () => {
		render(<BollettaLuceStep />)
		const btn = screen.getByText('Continua → Risultati')
		expect(btn).toBeDisabled()
	})

	it('pulsante "Continua" è abilitato se totaleBolletta > 0 e numeroBolletta valorizzato', () => {
		render(<BollettaLuceStep />)
		fireEvent.change(screen.getByLabelText('Importo Totale Bolletta'), {
			target: { value: '100' },
		})
		fireEvent.change(screen.getByLabelText('Numero Bolletta'), {
			target: { value: 'LU-001' },
		})
		const btn = screen.getByText('Continua → Risultati')
		expect(btn).not.toBeDisabled()
	})

	it('naviga a "risultati" al click su Continua', () => {
		render(<BollettaLuceStep />)
		fireEvent.change(screen.getByLabelText('Importo Totale Bolletta'), {
			target: { value: '100' },
		})
		fireEvent.change(screen.getByLabelText('Numero Bolletta'), {
			target: { value: 'LU-001' },
		})
		fireEvent.click(screen.getByText('Continua → Risultati'))
		expect(useAppStore.getState().activeStep).toBe('risultati')
	})

	it('naviga a "condomini" al click su ← Condomini', () => {
		render(<BollettaLuceStep />)
		fireEvent.click(screen.getByText('← Condomini'))
		expect(useAppStore.getState().activeStep).toBe('condomini')
	})

	it('azzera i dati della bolletta luce', () => {
		render(<BollettaLuceStep />)
		fireEvent.change(screen.getByLabelText('Importo Totale Bolletta'), {
			target: { value: '100' },
		})
		fireEvent.click(screen.getByText('Azzera dati bolletta'))
		expect(useAppStore.getState().bollettaLuce.totaleBolletta).toBe(0)
	})

	it('aggiorna i campi data', () => {
		render(<BollettaLuceStep />)
		const dataInizio = screen.getByLabelText('Data inizio periodo')
		fireEvent.change(dataInizio, { target: { value: '2025-01-01' } })
		expect(useAppStore.getState().bollettaLuce.dataInizio).toBe('2025-01-01')
	})
})

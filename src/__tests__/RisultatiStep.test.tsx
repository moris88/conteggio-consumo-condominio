import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RisultatiStep } from '@/components/RisultatiStep'
import { useAppStore } from '@/store/useAppStore'

// Mock per le icone e modern-screenshot/jspdf
vi.mock('modern-screenshot', () => ({
	domToCanvas: vi.fn(),
}))
vi.mock('jspdf', () => ({
	default: vi.fn(),
}))

describe('RisultatiStep', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
	})

	it('mostra avviso se non ci sono dati sufficienti', () => {
		render(<RisultatiStep />)
		expect(screen.getByText(/Dati insufficienti/i)).toBeDefined()
	})

	it('visualizza la tabella quando ci sono i dati', () => {
		act(() => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
		})

		const id = useAppStore.getState().condomini[0].id

		act(() => {
			useAppStore
				.getState()
				.updateCondomino(id, { letturaPrecedente: 10, letturaAttuale: 20 })
			useAppStore.getState().setBolletta({
				...useAppStore.getState().bolletta,
				consumoTotale: 10,
				quotaFissa: 5,
				iva: 1,
				spesePostali: 1,
			})
		})

		render(<RisultatiStep />)

		expect(screen.getByText('Tabella Ripartizione')).toBeDefined()
		expect(screen.getByText(/Mario/i)).toBeDefined()
		expect(screen.getByText(/Rossi/i)).toBeDefined()
		expect(screen.getAllByText(/10/).length).toBeGreaterThan(0) // Consumo reale

		// Verifica pulsanti export
		expect(screen.getByText('PDF')).toBeDefined()
		expect(screen.getByText('CSV')).toBeDefined()
		expect(screen.getByText('Anteprima PDF')).toBeDefined()
	})
})

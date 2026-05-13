import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RisultatiStep } from '@/components/RisultatiStep'
import { useAppStore } from '@/store/useAppStore'

// Mock per le icone e modern-screenshot/jspdf
vi.mock('modern-screenshot', () => ({
	domToCanvas: vi.fn().mockResolvedValue({
		width: 1000,
		height: 1000,
		toDataURL: vi.fn().mockReturnValue('data:image/png;base64,abc'),
	}),
}))

const { MockJsPDF } = vi.hoisted(() => {
	class MockJsPDF {
		internal = {
			pageSize: {
				getWidth: () => 210,
				getHeight: () => 297,
			},
		}
		addImage = vi.fn()
		save = vi.fn()
		output = vi.fn().mockReturnValue(new Blob())
	}
	return { MockJsPDF }
})

vi.mock('jspdf', () => ({
	default: MockJsPDF,
}))

// Mock URL
globalThis.URL.createObjectURL = vi.fn(() => 'blob-url')
globalThis.URL.revokeObjectURL = vi.fn()

describe('RisultatiStep', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
		vi.clearAllMocks()
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
		expect(screen.getByText('← Consumi')).toBeDefined()
		expect(screen.getByText('CSV')).toBeDefined()
		expect(screen.getByText('Anteprima PDF')).toBeDefined()
	})

	it('apre anteprima PDF', async () => {
		act(() => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			useAppStore.getState().updateCondomino(useAppStore.getState().condomini[0].id, { letturaPrecedente: 10, letturaAttuale: 20 })
			useAppStore.getState().setBolletta({
				...useAppStore.getState().bolletta,
				consumoTotale: 10,
			})
		})

		render(<RisultatiStep />)
		
		const previewBtn = screen.getByText('Anteprima PDF')
		fireEvent.click(previewBtn)

		// Dovrebbe mostrare un caricamento
		expect(screen.getByText('Caricamento...')).toBeDefined()
	})

	it('esporta in CSV', async () => {
		act(() => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			useAppStore.getState().setBolletta({
				...useAppStore.getState().bolletta,
				consumoTotale: 10,
			})
		})

		render(<RisultatiStep />)
		
		const csvBtn = screen.getByText('CSV')
		fireEvent.click(csvBtn)

		expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
	})
})

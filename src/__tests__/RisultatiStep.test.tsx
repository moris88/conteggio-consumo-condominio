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

		const id = useAppStore.getState().condominiAcqua[0].id

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
		await act(async () => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			useAppStore
				.getState()
				.updateCondomino(useAppStore.getState().condominiAcqua[0].id, {
					letturaPrecedente: 10,
					letturaAttuale: 20,
				})
			useAppStore.getState().setBolletta({
				...useAppStore.getState().bolletta,
				consumoTotale: 10,
			})
		})

		render(<RisultatiStep />)

		const previewBtn = screen.getByRole('button', { name: /Anteprima PDF/i })
		await act(async () => {
			fireEvent.click(previewBtn)
		})

		// Dovrebbe mostrare un caricamento o il modal
		expect(
			screen.getByRole('heading', { name: /Anteprima PDF/i }),
		).toBeDefined()
	})

	it('esporta in CSV', async () => {
		await act(async () => {
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

		const csvBtn = screen.getByRole('button', { name: /CSV/i })
		await act(async () => {
			fireEvent.click(csvBtn)
		})

		expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
	})

	it('salva i risultati nello storico tramite modal', async () => {
		await act(async () => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			useAppStore
				.getState()
				.updateCondomino(useAppStore.getState().condominiAcqua[0].id, {
					letturaPrecedente: 10,
					letturaAttuale: 20,
				})
			useAppStore.getState().setBolletta({
				...useAppStore.getState().bolletta,
				consumoTotale: 10,
				numeroBolletta: 'TEST-STOR',
			})
		})

		render(<RisultatiStep />)

		// Apre il modal
		const saveBtn = screen.getByRole('button', { name: /Salva in Storico/i })
		await act(async () => {
			fireEvent.click(saveBtn)
		})

		// Il modal è aperto (verifica presenza input nota)
		expect(screen.getByPlaceholderText(/Bolletta dicembre/i)).toBeDefined()

		// Inserisce una nota
		const notaInput = screen.getByPlaceholderText(/Bolletta dicembre/i)
		fireEvent.change(notaInput, { target: { value: 'Nota dal test' } })

		// Conferma il salvataggio
		const confirmBtn = screen.getByRole('button', { name: /^Salva$/i })
		await act(async () => {
			fireEvent.click(confirmBtn)
		})

		expect(useAppStore.getState().storico).toHaveLength(1)
		expect(useAppStore.getState().storico[0].note).toBe('Nota dal test')
		expect(useAppStore.getState().activeStep).toBe('storico')
	})

	it('mostra alert discrepanza elevata', async () => {
		await act(async () => {
			useAppStore.getState().addCondomino({
				nome: 'Mario',
				cognome: 'Rossi',
				appartamento: 'A1',
				tipo: 'proprietario-residente',
			})
			// Consumo reale 10 vs bolletta 100 → discrepanza 90%
			useAppStore
				.getState()
				.updateCondomino(useAppStore.getState().condominiAcqua[0].id, {
					letturaPrecedente: 10,
					letturaAttuale: 20,
				})
			useAppStore.getState().setBolletta({
				...useAppStore.getState().bolletta,
				consumoTotale: 100,
				sogliaDiscrepanza: 10,
			})
		})

		render(<RisultatiStep />)

		expect(screen.getByText(/Discrepanza elevata/i)).toBeDefined()
	})

	it('visualizza i risultati per la bolletta luce', async () => {
		await act(async () => {
			useAppStore.getState().setType('luce')
			useAppStore.getState().addCondomino({
				nome: 'Luigi',
				cognome: 'Verdi',
				appartamento: 'B2',
				tipo: 'proprietario-residente',
			})
			useAppStore.getState().setBollettaLuce({
				...useAppStore.getState().bollettaLuce,
				totaleBolletta: 100,
				spesePostali: 10,
				speseGestione: 5,
			})
		})

		render(<RisultatiStep />)

		expect(screen.getByText('Ripartizione Bolletta Luce')).toBeDefined()
		expect(screen.getByText(/Luigi/i)).toBeDefined()
		expect(screen.getByText(/Verdi/i)).toBeDefined()
		expect(screen.getAllByText('100,00 €').length).toBeGreaterThan(0) // Quota base
	})
})

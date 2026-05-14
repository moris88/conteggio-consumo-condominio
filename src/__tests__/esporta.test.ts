import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BollettaAcqua, RisultatoCalcolo } from '@/types'
import { exportToCSV, exportToPDF, generatePDFBlobUrl } from '@/utils/esporta'

// Mock modern-screenshot
vi.mock('modern-screenshot', () => ({
	domToCanvas: vi.fn().mockResolvedValue({
		width: 1000,
		height: 1000,
		toDataURL: vi.fn().mockReturnValue('data:image/png;base64,abc'),
	}),
}))

const { mockSave, mockAddImage, mockOutput, MockJsPDF } = vi.hoisted(() => {
	const save = vi.fn()
	const addImage = vi.fn()
	const output = vi.fn().mockReturnValue(new Blob())

	class MockJsPDF {
		internal = {
			pageSize: {
				getWidth: () => 210,
				getHeight: () => 297,
			},
		}
		addImage = addImage
		save = save
		output = output
	}

	return {
		mockSave: save,
		mockAddImage: addImage,
		mockOutput: output,
		MockJsPDF,
	}
})

vi.mock('jspdf', () => ({
	default: MockJsPDF,
}))

describe('esporta utility', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('exportToCSV genera un file scaricabile', () => {
		// Mock URL.createObjectURL e document.createElement
		const createObjectURLMock = vi.fn(() => 'blob-url')
		const revokeObjectURLMock = vi.fn()
		globalThis.URL.createObjectURL = createObjectURLMock
		globalThis.URL.revokeObjectURL = revokeObjectURLMock

		const link = {
			click: vi.fn(),
			setAttribute: vi.fn(),
			href: '',
			download: '',
		}
		vi.spyOn(document, 'createElement').mockReturnValue(link as any)

		const mockRisultato: RisultatoCalcolo = {
			righe: [
				{
					condomino: {
						id: '1',
						nome: 'M.',
						cognome: 'Rossi',
						appartamento: 'A1',
						tipo: 'proprietario-residente',
						letturaAttuale: 100,
						letturaPrecedente: 50,
					},
					consumoReale: 50,
					consumoTotale: 50,
					coeffProporzionale: 1,
					quotaFissa: 10,
					tariffaAgevolata: 20,
					eccedenzaBase: 5,
					eccedenzaFascia1: 0,
					eccedenzaFascia2: 0,
					eccedenzaFascia3: 0,
					quotaFogna: 5,
					quotaDepurazione: 10,
					quotaPerequazione: 10,
					iva: 5,
					rettificaAcconti: 0,
					totaleFatturaAQP: 55,
					spesePostali: 1,
					speseGestione: 0,
					totaleDaPagare: 56,
					isNonResidente: false,
				},
			],
			consumoRealeTotale: 50,
			consumoBolletta: 50,
			discrepanzaMC: 0,
			discrepanzaPercent: 0,
			discrepanzaElevata: false,
			totali: {
				consumoReale: 50,
				consumoTotale: 50,
				quotaFissa: 10,
				tariffaAgevolata: 20,
				eccedenzaBase: 5,
				eccedenzaFascia1: 0,
				eccedenzaFascia2: 0,
				eccedenzaFascia3: 0,
				quotaFogna: 5,
				quotaDepurazione: 10,
				quotaPerequazione: 10,
				iva: 5,
				rettificaAcconti: 0,
				totaleFatturaAQP: 55,
				spesePostali: 1,
				speseGestione: 0,
				totaleDaPagare: 56,
			},
		}

		const mockBolletta: BollettaAcqua = {
			dataInizio: '2025-01-01',
			dataFine: '2025-03-31',
			dataScadenza: '2025-04-15',
			consumoTotale: 50,
			quotaFissa: 10,
			tariffaAgevolata: 0,
			tariffaAgevolataMin: 0,
			eccedenzaBase: 0,
			eccedenzaBaseMin: 0,
			eccedenzaFascia1: 0,
			eccedenzaFascia1Min: 0,
			eccedenzaFascia2: 0,
			eccedenzaFascia2Min: 0,
			eccedenzaFascia3: 0,
			eccedenzaFascia3Min: 0,
			quotaFogna: 0,
			quotaDepurazione: 0,
			iva: 0,
			rettificaAcconti: 0,
			spesePostali: 0,
			speseGestione: 0,
			numeroBolletta: '12345',
			viaCondominio: 'Via Roma 1',
			dataDocumento: '2025-04-01',
			dataProssimaLettura: '2025-07-01',
			sogliaDiscrepanza: 20,
			quotaPerequazione: 50,
		}

		exportToCSV(mockRisultato, mockBolletta)

		expect(document.createElement).toHaveBeenCalledWith('a')
		expect(link.download).toBe('ripartizione-acqua-2025-04-15.csv')
		expect(link.click).toHaveBeenCalled()
		expect(revokeObjectURLMock).toHaveBeenCalled()
	})

	it('exportToPDF chiama le funzioni di generazione PDF', async () => {
		const mockElement = {
			classList: {
				add: vi.fn(),
				remove: vi.fn(),
			},
			scrollWidth: 1000,
			scrollHeight: 1000,
		}
		const mockRef = {
			current: mockElement,
		}

		await exportToPDF(mockRef as any, '2025-05-13')

		expect(mockElement.classList.add).toHaveBeenCalledWith('pdf-export-mode')
		expect(mockAddImage).toHaveBeenCalled()
		expect(mockSave).toHaveBeenCalledWith('ripartizione-acqua-2025-05-13.pdf')
		expect(mockElement.classList.remove).toHaveBeenCalledWith('pdf-export-mode')
	})

	it('generatePDFBlobUrl restituisce un URL blob', async () => {
		const createObjectURLMock = vi.fn(() => 'blob-url')
		globalThis.URL.createObjectURL = createObjectURLMock

		const mockElement = {
			classList: {
				add: vi.fn(),
				remove: vi.fn(),
			},
			scrollWidth: 1000,
			scrollHeight: 1000,
		}
		const mockRef = {
			current: mockElement,
		}

		const url = await generatePDFBlobUrl(mockRef as any)

		expect(url).toBe('blob-url')
		expect(mockOutput).toHaveBeenCalledWith('blob')
		expect(mockElement.classList.remove).toHaveBeenCalledWith('pdf-export-mode')
	})

	it('exportToPDF non fa nulla se ref è null', async () => {
		const mockRef = { current: null }
		await exportToPDF(mockRef as any, 'date')
		expect(mockSave).not.toHaveBeenCalled()
	})

	it('generatePDFBlobUrl restituisce null se ref è null', async () => {
		const mockRef = { current: null }
		const url = await generatePDFBlobUrl(mockRef as any)
		expect(url).toBeNull()
	})

	it('exportToCSV genera un file per bolletta luce', () => {
		const createObjectURLMock = vi.fn(() => 'blob-url')
		globalThis.URL.createObjectURL = createObjectURLMock
		globalThis.URL.revokeObjectURL = vi.fn()

		const link = {
			click: vi.fn(),
			setAttribute: vi.fn(),
			href: '',
			download: '',
		}
		vi.spyOn(document, 'createElement').mockReturnValue(link as any)

		const mockRisultato: any = {
			righe: [
				{
					condomino: {
						id: '1',
						nome: 'L.',
						cognome: 'Verdi',
						appartamento: 'B2',
					},
					quotaBase: 10,
					spesePostali: 1,
					speseGestione: 0,
					totaleDaPagare: 11,
				},
			],
			totali: {
				quotaBase: 10,
				spesePostali: 1,
				speseGestione: 0,
				totaleDaPagare: 11,
			},
		}

		const mockBollettaLuce: any = {
			dataScadenza: '2025-04-15',
			totaleBolletta: 10,
		}

		exportToCSV(mockRisultato, mockBollettaLuce, false)

		expect(link.download).toBe('ripartizione-luce-2025-04-15.csv')
	})
})

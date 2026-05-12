import { describe, expect, it, vi } from 'vitest'
import type { BollettaAcqua, RisultatoCalcolo } from '@/types'
import { exportToCSV } from '@/utils/esporta'

describe('esporta utility', () => {
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
					totaleParziale: 50,
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
				totaleParziale: 50,
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
})

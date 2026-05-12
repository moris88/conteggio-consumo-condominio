import { describe, expect, it } from 'vitest'

import type { BollettaAcqua, Condomino } from '@/types'
import {
	calcolaConsumoProporzionale,
	calcolaDiscrepanza,
	calcolaRiga,
	calcolaRisultati,
	fmt,
	fmtEur,
	fmtMc,
	getConsumoReale,
} from '@/utils/calcoli'

// Dati di test basati sul PDF reale: Fattura AQP periodo 19/09/2025 - 11/02/2026
const BOLLETTA_PDF: BollettaAcqua = {
	dataInizio: '2025-09-19',
	dataFine: '2026-02-11',
	dataScadenza: '2026-04-03',
	numeroBolletta: '',
	viaCondominio: '',
	dataDocumento: '',
	dataProssimaLettura: '',
	sogliaDiscrepanza: 10,
	consumoTotale: 94,
	quotaFissa: 38.05,
	tariffaAgevolata: 37.74,
	eccedenzaBase: 23.58,
	eccedenzaFascia1: 37.78,
	eccedenzaFascia2: 0,
	eccedenzaFascia3: 0,
	quotaFogna: 21.01,
	quotaDepurazione: 69.93,
	quotaPerequazione: 0,
	iva: 17.28,
	rettificaAcconti: 55.26,
	spesePostali: 2.1,
	speseGestione: 0,
}

const BERLOCO: Condomino = {
	id: '1',
	nome: 'A.V.',
	cognome: 'Berloco',
	appartamento: 'Int. 1',
	tipo: 'proprietario-residente',
	letturaAttuale: 1402,
	letturaPrecedente: 1387,
}

const NERENXA: Condomino = {
	id: '2',
	nome: 'T.',
	cognome: 'Nerenxa',
	appartamento: 'Int. 2',
	tipo: 'inquilino',
	letturaAttuale: 477,
	letturaPrecedente: 454,
}

describe('getConsumoReale', () => {
	it('calcola la differenza tra letture', () => {
		expect(getConsumoReale(BERLOCO)).toBe(15)
		expect(getConsumoReale(NERENXA)).toBe(23)
	})

	it('restituisce 0 se la lettura attuale < precedente', () => {
		const c: Condomino = {
			...BERLOCO,
			letturaAttuale: 100,
			letturaPrecedente: 200,
		}
		expect(getConsumoReale(c)).toBe(0)
	})

	it('restituisce 0 se entrambe le letture sono 0', () => {
		const c: Condomino = { ...BERLOCO, letturaAttuale: 0, letturaPrecedente: 0 }
		expect(getConsumoReale(c)).toBe(0)
	})
})

describe('calcolaConsumoProporzionale', () => {
	it('calcola il consumo proporzionale correttamente (dati PDF)', () => {
		// Berloco: 94 * 15/38 = 37.1... → 37
		expect(calcolaConsumoProporzionale(15, 38, 94)).toBe(37)
		// Nerenxa: 94 * 23/38 = 56.9... → 57
		expect(calcolaConsumoProporzionale(23, 38, 94)).toBe(57)
	})

	it('restituisce 0 se consumoRealeTotale è 0', () => {
		expect(calcolaConsumoProporzionale(10, 0, 100)).toBe(0)
	})

	it('restituisce 0 se consumoBolletta è 0', () => {
		expect(calcolaConsumoProporzionale(10, 100, 0)).toBe(0)
	})

	it('la somma dei consumi proporzionali eguaglia il consumo bolletta', () => {
		const berloco = calcolaConsumoProporzionale(15, 38, 94)
		const nerenxa = calcolaConsumoProporzionale(23, 38, 94)
		expect(berloco + nerenxa).toBe(94)
	})
})

describe('calcolaDiscrepanza', () => {
	it('calcola discrepanza corretta (dati PDF)', () => {
		const result = calcolaDiscrepanza(38, 94)
		expect(result.discrepanzaMC).toBe(56)
		// 56/94 * 100 = 59.57%
		expect(result.discrepanzaPercent).toBeCloseTo(59.57, 1)
		expect(result.discrepanzaElevata).toBe(true)
	})

	it('non è elevata se < 10%', () => {
		const result = calcolaDiscrepanza(91, 94)
		expect(result.discrepanzaElevata).toBe(false)
	})

	it('è esattamente al confine del 10%', () => {
		const result = calcolaDiscrepanza(84.6, 94)
		expect(result.discrepanzaElevata).toBe(false)
	})

	it('restituisce 0 se consumoBolletta è 0', () => {
		const result = calcolaDiscrepanza(10, 0)
		expect(result.discrepanzaPercent).toBe(0)
	})

	it('gestisce consumo reale uguale al dichiarato', () => {
		const result = calcolaDiscrepanza(94, 94)
		expect(result.discrepanzaMC).toBe(0)
		expect(result.discrepanzaPercent).toBe(0)
		expect(result.discrepanzaElevata).toBe(false)
	})
})

describe('calcolaRiga — Berloco (dati PDF)', () => {
	let riga: ReturnType<typeof calcolaRiga>
	beforeEach(() => {
		riga = calcolaRiga(BERLOCO, BOLLETTA_PDF, 2, 38)
	})

	it('calcola consumoReale correttamente', () => {
		expect(riga.consumoReale).toBe(15)
	})

	it('calcola consumoTotale = 37 mc', () => {
		expect(riga.consumoTotale).toBe(37)
	})

	it('calcola quotaFissa = 38.05 / 2 = 19.025', () => {
		expect(riga.quotaFissa).toBeCloseTo(19.025, 3)
	})

	it('calcola tariffaAgevolata ≈ 14.86', () => {
		expect(riga.tariffaAgevolata).toBeCloseTo(14.855, 2)
	})

	it('calcola eccedenzaBase ≈ 9.28', () => {
		expect(riga.eccedenzaBase).toBeCloseTo(9.278, 2)
	})

	it('calcola eccedenzaFascia1 ≈ 14.87', () => {
		expect(riga.eccedenzaFascia1).toBeCloseTo(14.871, 2)
	})

	it('calcola quotaFogna ≈ 8.27', () => {
		expect(riga.quotaFogna).toBeCloseTo(8.271, 2)
	})

	it('calcola quotaDepurazione ≈ 27.53', () => {
		expect(riga.quotaDepurazione).toBeCloseTo(27.525, 2)
	})

	it('calcola totaleParziale ≈ 93.83', () => {
		expect(riga.totaleParziale).toBeCloseTo(93.83, 1)
	})

	it('calcola iva ≈ 6.80', () => {
		expect(riga.iva).toBeCloseTo(6.804, 2)
	})

	it('calcola rettificaAcconti ≈ 21.75', () => {
		expect(riga.rettificaAcconti).toBeCloseTo(21.752, 2)
	})

	it('calcola totaleFatturaAQP ≈ 78.88', () => {
		// 93.83 + 6.80 - 21.75 = 78.88
		expect(riga.totaleFatturaAQP).toBeCloseTo(78.88, 1)
	})

	it('calcola spesePostali = 2.10 / 2 = 1.05', () => {
		expect(riga.spesePostali).toBeCloseTo(1.05, 2)
	})

	it('calcola totaleDaPagare ≈ 79.93', () => {
		expect(riga.totaleDaPagare).toBeCloseTo(79.93, 1)
	})

	it('isNonResidente = false', () => {
		expect(riga.isNonResidente).toBe(false)
	})
})

describe('calcolaRiga — Nerenxa (dati PDF)', () => {
	let riga: ReturnType<typeof calcolaRiga>
	beforeEach(() => {
		riga = calcolaRiga(NERENXA, BOLLETTA_PDF, 2, 38)
	})

	it('calcola tariffaAgevolata ≈ 22.88', () => {
		expect(riga.tariffaAgevolata).toBeCloseTo(22.884, 2)
	})

	it('calcola totaleFatturaAQP ≈ 111.23', () => {
		expect(riga.totaleFatturaAQP).toBeCloseTo(111.23, 1)
	})

	it('calcola totaleDaPagare ≈ 112.28', () => {
		expect(riga.totaleDaPagare).toBeCloseTo(112.28, 1)
	})
})

describe('calcolaRiga — proprietario non residente', () => {
	const nonRes: Condomino = {
		...BERLOCO,
		tipo: 'proprietario-non-residente',
	}

	it('ha tutti i costi variabili a 0', () => {
		const riga = calcolaRiga(nonRes, BOLLETTA_PDF, 2, 38)
		expect(riga.tariffaAgevolata).toBe(0)
		expect(riga.quotaFogna).toBe(0)
		expect(riga.quotaDepurazione).toBe(0)
		expect(riga.consumoReale).toBe(0)
		expect(riga.consumoTotale).toBe(0)
		expect(riga.isNonResidente).toBe(true)
	})

	it('paga quota fissa + IVA (10%) + spese postali (NON paga spese gestione)', () => {
		const riga = calcolaRiga(nonRes, BOLLETTA_PDF, 2, 38)
		const quotaFissa = 38.05 / 2
		expect(riga.quotaFissa).toBeCloseTo(quotaFissa, 3)
		expect(riga.iva).toBeCloseTo(quotaFissa * 0.1, 4)
		expect(riga.spesePostali).toBeCloseTo(2.1 / 2, 3)
		expect(riga.speseGestione).toBe(0)
	})
})

describe('calcolaRisultati (dati PDF completi)', () => {
	it('calcola risultati corretti per entrambi i condomini', () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)
		expect(risultato.consumoRealeTotale).toBe(38)
		expect(risultato.consumoBolletta).toBe(94)
		expect(risultato.discrepanzaMC).toBe(56)
		expect(risultato.discrepanzaElevata).toBe(true)
		expect(risultato.righe).toHaveLength(2)
	})

	it('la somma dei totali corrisponde ai totali di riga', () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)
		const sum = risultato.righe.reduce((a, r) => a + r.totaleDaPagare, 0)
		expect(sum).toBeCloseTo(risultato.totali.totaleDaPagare, 5)
	})

	it('il totale da pagare complessivo è ≈ 192.21 €', () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)
		expect(risultato.totali.totaleDaPagare).toBeCloseTo(192.21, 1)
	})

	it('gestisce lista condomini vuota senza errori', () => {
		const risultato = calcolaRisultati([], BOLLETTA_PDF)
		expect(risultato.righe).toHaveLength(0)
		expect(risultato.totali.totaleDaPagare).toBe(0)
	})

	it('solo i residenti contribuiscono al consumo reale totale', () => {
		const nonRes: Condomino = {
			...BERLOCO,
			id: '3',
			tipo: 'proprietario-non-residente',
		}
		const risultato = calcolaRisultati([BERLOCO, NERENXA, nonRes], BOLLETTA_PDF)
		expect(risultato.consumoRealeTotale).toBe(38) // Non-residente non conta
	})
})

describe('funzioni di formattazione', () => {
	it('fmt formatta correttamente con virgola italiana', () => {
		expect(fmt(19.03)).toBe('19,03')
		expect(fmt(100)).toBe('100,00')
		expect(fmt(0.1, 1)).toBe('0,1')
	})

	it('fmtEur aggiunge il simbolo €', () => {
		expect(fmtEur(19.03)).toBe('19,03 €')
	})

	it('fmtMc arrotonda a intero e aggiunge mc', () => {
		expect(fmtMc(37.5)).toBe('38 mc')
		expect(fmtMc(94)).toBe('94 mc')
	})
})

describe('calcolaRiga — edge cases', () => {
	it('gestisce consumoRealeTotale = 0 (tutti hanno consumo 0)', () => {
		const c: Condomino = { ...BERLOCO, letturaAttuale: 0, letturaPrecedente: 0 }
		const riga = calcolaRiga(c, BOLLETTA_PDF, 1, 0)
		expect(riga.consumoTotale).toBe(0)
		expect(riga.tariffaAgevolata).toBe(0)
	})

	it('gestisce un singolo condomino', () => {
		const riga = calcolaRiga(BERLOCO, BOLLETTA_PDF, 1, 15)
		// Con un solo residente, prende tutto il consumo bolletta
		expect(riga.consumoTotale).toBe(94)
		expect(riga.quotaFissa).toBeCloseTo(38.05, 2)
	})
})

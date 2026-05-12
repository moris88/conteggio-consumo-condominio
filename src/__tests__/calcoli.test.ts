import { describe, expect, it } from 'vitest'

import type { BollettaAcqua, Condomino } from '@/types'
import {
	calcolaDiscrepanza,
	calcolaRisultati,
	fmt,
	fmtEur,
	fmtMc,
	getConsumoReale,
} from '@/utils/calcoli'

// Dati di test basati sul PDF reale con aggiunta delle soglie minime
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
	// Soglie minime (es. un condomino paga eccedenza solo se > di questi mc)
	tariffaAgevolataMin: 0,
	eccedenzaBaseMin: 18,
	eccedenzaFascia1Min: 30,
	eccedenzaFascia2Min: 50,
	eccedenzaFascia3Min: 100,
	// Valori economici
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
	letturaAttuale: 1402, // Consumo Reale: 15
	letturaPrecedente: 1387,
}

const NERENXA: Condomino = {
	id: '2',
	nome: 'T.',
	cognome: 'Nerenxa',
	appartamento: 'Int. 2',
	tipo: 'inquilino',
	letturaAttuale: 477, // Consumo Reale: 23
	letturaPrecedente: 454,
}

describe('getConsumoReale', () => {
	it('calcola la differenza tra letture', () => {
		expect(getConsumoReale(BERLOCO)).toBe(15)
		expect(getConsumoReale(NERENXA)).toBe(23)
	})
})

describe('calcolaDiscrepanza', () => {
	it('calcola discrepanza corretta', () => {
		const result = calcolaDiscrepanza(38, 94) // 38 totale reale vs 94 bolletta
		expect(result.discrepanzaMC).toBe(56)
		expect(result.discrepanzaPercent).toBeCloseTo(59.57, 1)
	})
})

describe('Logica di Ripartizione Eccedenze (Selettiva)', () => {
	it('Berloco (15mc) non paga eccedenzaBase se soglia è 18', () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)
		const rigaBerloco = risultato.righe.find((r) => r.condomino.id === '1')!

		// Berloco ha 15mc, la soglia Base è 18.
		// Nerenxa ha 23mc, supera la soglia Base.
		// Quindi Nerenxa paga TUTTA l'eccedenza base della bolletta.
		expect(rigaBerloco.eccedenzaBase).toBe(0)
	})

	it("Nerenxa (23mc) paga tutta l'eccedenzaBase se è l'unico sopra soglia", () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)
		const rigaNerenxa = risultato.righe.find((r) => r.condomino.id === '2')!

		expect(rigaNerenxa.eccedenzaBase).toBeCloseTo(BOLLETTA_PDF.eccedenzaBase, 2)
	})

	it('Entrambi pagano tariffaAgevolata se soglia è 0', () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)
		const rigaB = risultato.righe[0]
		const rigaN = risultato.righe[1]

		// Ripartizione proporzionale: 15 / (15+23) e 23 / (15+23)
		const totale = rigaB.tariffaAgevolata + rigaN.tariffaAgevolata
		expect(totale).toBeCloseTo(BOLLETTA_PDF.tariffaAgevolata, 2)
		expect(rigaB.tariffaAgevolata).toBeLessThan(rigaN.tariffaAgevolata)
	})

	it('Fallback: se nessuno è sopra soglia, ripartisce proporzionalmente', () => {
		const bollettaConEccedenzaImpossibile = {
			...BOLLETTA_PDF,
			eccedenzaFascia1Min: 100, // Nessuno dei due (15 e 23) arriva a 100
			eccedenzaFascia1: 50,
		}
		const risultato = calcolaRisultati(
			[BERLOCO, NERENXA],
			bollettaConEccedenzaImpossibile,
		)
		const rigaB = risultato.righe[0]

		// Dovrebbe applicare il fallback e dare una parte a Berloco
		expect(rigaB.eccedenzaFascia1).toBeGreaterThan(0)
		expect(rigaB.eccedenzaFascia1).toBeCloseTo((50 * 15) / 38, 2)
	})
})

describe('calcolaRisultati - Integrità Totali', () => {
	it('la somma di tutte le voci delle righe deve eguagliare i totali della bolletta', () => {
		const risultato = calcolaRisultati([BERLOCO, NERENXA], BOLLETTA_PDF)

		expect(risultato.totali.quotaFissa).toBeCloseTo(BOLLETTA_PDF.quotaFissa, 2)
		expect(risultato.totali.tariffaAgevolata).toBeCloseTo(
			BOLLETTA_PDF.tariffaAgevolata,
			2,
		)
		expect(risultato.totali.eccedenzaBase).toBeCloseTo(
			BOLLETTA_PDF.eccedenzaBase,
			2,
		)
		expect(risultato.totali.iva).toBeCloseTo(BOLLETTA_PDF.iva, 2)
	})

	it('paga correttamente il proprietario non residente', () => {
		const nonRes: Condomino = {
			...BERLOCO,
			id: '3',
			tipo: 'proprietario-non-residente',
		}
		const risultato = calcolaRisultati([nonRes, NERENXA], BOLLETTA_PDF)
		const rigaNonRes = risultato.righe.find((r) => r.condomino.id === '3')!

		const quotaAttesa = BOLLETTA_PDF.quotaFissa / 2
		expect(rigaNonRes.quotaFissa).toBeCloseTo(quotaAttesa, 2)
		expect(rigaNonRes.iva).toBeCloseTo(quotaAttesa * 0.1, 2)
		expect(rigaNonRes.tariffaAgevolata).toBe(0)
		expect(rigaNonRes.totaleDaPagare).toBeCloseTo(
			quotaAttesa + quotaAttesa * 0.1 + BOLLETTA_PDF.spesePostali / 2,
			2,
		)
	})
})

describe('funzioni di formattazione', () => {
	it('fmt formatta correttamente con virgola italiana', () => {
		expect(fmt(19.03)).toBe('19,03')
	})

	it('fmtEur aggiunge il simbolo €', () => {
		expect(fmtEur(19.03)).toBe('19,03 €')
	})

	it('fmtMc arrotonda a intero e aggiunge mc', () => {
		expect(fmtMc(37.5)).toBe('38 mc')
	})
})

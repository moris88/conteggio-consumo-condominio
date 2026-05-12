import type {
	BollettaAcqua,
	Condomino,
	RigaRisultato,
	RisultatoCalcolo,
	TotaliRisultato,
} from '@/types'

export function getConsumoReale(c: Condomino): number {
	return Math.max(0, c.letturaAttuale - c.letturaPrecedente)
}

export function calcolaConsumoProporzionale(
	consumoReale: number,
	consumoRealeTotale: number,
	consumoBolletta: number,
): number {
	if (consumoRealeTotale <= 0 || consumoBolletta <= 0) return 0
	return Math.round((consumoBolletta * consumoReale) / consumoRealeTotale)
}

export function calcolaDiscrepanza(
	consumoRealeTotale: number,
	consumoBolletta: number,
	soglia = 10,
): {
	discrepanzaMC: number
	discrepanzaPercent: number
	discrepanzaElevata: boolean
} {
	const discrepanzaMC = consumoBolletta - consumoRealeTotale
	const discrepanzaPercent =
		consumoBolletta > 0 ? (Math.abs(discrepanzaMC) / consumoBolletta) * 100 : 0
	const roundedPercent = Math.round(discrepanzaPercent * 100) / 100
	return {
		discrepanzaMC,
		discrepanzaPercent: roundedPercent,
		discrepanzaElevata: roundedPercent > soglia,
	}
}

export function calcolaRiga(
	condomino: Condomino,
	bolletta: BollettaAcqua,
	nCondomini: number,
	consumoRealeTotale: number,
): RigaRisultato {
	const isNonResidente = condomino.tipo === 'proprietario-non-residente'
	const consumoReale = getConsumoReale(condomino)
	const n = Math.max(1, nCondomini)

	const quotaFissa = bolletta.quotaFissa / n
	const spesePostali = bolletta.spesePostali / n
	const speseGestione = bolletta.speseGestione / n

	if (isNonResidente) {
		// Paga solo quota fissa + IVA (10%) + spese postali
		const iva = quotaFissa * 0.1
		const totaleFatturaAQP = quotaFissa + iva
		const totaleDaPagare = totaleFatturaAQP + spesePostali
		return {
			condomino,
			consumoReale: 0,
			consumoTotale: 0,
			coeffProporzionale: 0,
			quotaFissa,
			tariffaAgevolata: 0,
			eccedenzaBase: 0,
			eccedenzaFascia1: 0,
			eccedenzaFascia2: 0,
			eccedenzaFascia3: 0,
			quotaFogna: 0,
			quotaDepurazione: 0,
			quotaPerequazione: 0,
			totaleParziale: quotaFissa,
			iva,
			rettificaAcconti: 0,
			totaleFatturaAQP,
			spesePostali,
			speseGestione: 0,
			totaleDaPagare,
			isNonResidente: true,
		}
	}

	const consumoTotale = calcolaConsumoProporzionale(
		consumoReale,
		consumoRealeTotale,
		bolletta.consumoTotale,
	)
	const coeff =
		bolletta.consumoTotale > 0 ? consumoTotale / bolletta.consumoTotale : 0

	const tariffaAgevolata = bolletta.tariffaAgevolata * coeff
	const eccedenzaBase = bolletta.eccedenzaBase * coeff
	const eccedenzaFascia1 = bolletta.eccedenzaFascia1 * coeff
	const eccedenzaFascia2 = bolletta.eccedenzaFascia2 * coeff
	const eccedenzaFascia3 = bolletta.eccedenzaFascia3 * coeff
	const quotaFogna = bolletta.quotaFogna * coeff
	const quotaDepurazione = bolletta.quotaDepurazione * coeff
	const quotaPerequazione = bolletta.quotaPerequazione * coeff

	const totaleParziale =
		quotaFissa +
		tariffaAgevolata +
		eccedenzaBase +
		eccedenzaFascia1 +
		eccedenzaFascia2 +
		eccedenzaFascia3 +
		quotaFogna +
		quotaDepurazione +
		quotaPerequazione

	const iva = bolletta.iva * coeff
	const rettificaAcconti = bolletta.rettificaAcconti * coeff
	const totaleFatturaAQP = totaleParziale + iva - rettificaAcconti
	const totaleDaPagare = totaleFatturaAQP + spesePostali + speseGestione

	return {
		condomino,
		consumoReale,
		consumoTotale,
		coeffProporzionale: coeff,
		quotaFissa,
		tariffaAgevolata,
		eccedenzaBase,
		eccedenzaFascia1,
		eccedenzaFascia2,
		eccedenzaFascia3,
		quotaFogna,
		quotaDepurazione,
		quotaPerequazione,
		totaleParziale,
		iva,
		rettificaAcconti,
		totaleFatturaAQP,
		spesePostali,
		speseGestione,
		totaleDaPagare,
		isNonResidente: false,
	}
}

const ZERO_TOTALI: TotaliRisultato = {
	consumoReale: 0,
	consumoTotale: 0,
	quotaFissa: 0,
	tariffaAgevolata: 0,
	eccedenzaBase: 0,
	eccedenzaFascia1: 0,
	eccedenzaFascia2: 0,
	eccedenzaFascia3: 0,
	quotaFogna: 0,
	quotaDepurazione: 0,
	quotaPerequazione: 0,
	totaleParziale: 0,
	iva: 0,
	rettificaAcconti: 0,
	totaleFatturaAQP: 0,
	spesePostali: 0,
	speseGestione: 0,
	totaleDaPagare: 0,
}

export function calcolaRisultati(
	condomini: Condomino[],
	bolletta: BollettaAcqua,
): RisultatoCalcolo {
	const nCondomini = condomini.length
	const consumoRealeTotale = condomini
		.filter((c) => c.tipo !== 'proprietario-non-residente')
		.reduce((sum, c) => sum + getConsumoReale(c), 0)

	const righe = condomini.map((c) =>
		calcolaRiga(c, bolletta, nCondomini, consumoRealeTotale),
	)

	const { discrepanzaMC, discrepanzaPercent, discrepanzaElevata } =
		calcolaDiscrepanza(
			consumoRealeTotale,
			bolletta.consumoTotale,
			bolletta.sogliaDiscrepanza,
		)

	const totali = righe.reduce<TotaliRisultato>(
		(acc, r) => {
			return {
				consumoReale: acc.consumoReale + r.consumoReale,
				consumoTotale: acc.consumoTotale + r.consumoTotale,
				quotaFissa: acc.quotaFissa + r.quotaFissa,
				tariffaAgevolata: acc.tariffaAgevolata + r.tariffaAgevolata,
				eccedenzaBase: acc.eccedenzaBase + r.eccedenzaBase,
				eccedenzaFascia1: acc.eccedenzaFascia1 + r.eccedenzaFascia1,
				eccedenzaFascia2: acc.eccedenzaFascia2 + r.eccedenzaFascia2,
				eccedenzaFascia3: acc.eccedenzaFascia3 + r.eccedenzaFascia3,
				quotaFogna: acc.quotaFogna + r.quotaFogna,
				quotaDepurazione: acc.quotaDepurazione + r.quotaDepurazione,
				quotaPerequazione: acc.quotaPerequazione + r.quotaPerequazione,
				totaleParziale: acc.totaleParziale + r.totaleParziale,
				iva: acc.iva + r.iva,
				rettificaAcconti: acc.rettificaAcconti + r.rettificaAcconti,
				totaleFatturaAQP: acc.totaleFatturaAQP + r.totaleFatturaAQP,
				spesePostali: acc.spesePostali + r.spesePostali,
				speseGestione: acc.speseGestione + r.speseGestione,
				totaleDaPagare: acc.totaleDaPagare + r.totaleDaPagare,
			}
		},
		{ ...ZERO_TOTALI },
	)

	return {
		righe,
		consumoRealeTotale,
		consumoBolletta: bolletta.consumoTotale,
		discrepanzaMC,
		discrepanzaPercent,
		discrepanzaElevata,
		totali,
	}
}

export function fmt(value: number, decimals = 2): string {
	return value.toFixed(decimals).replace('.', ',')
}

export function fmtEur(value: number): string {
	return `${fmt(value)} €`
}

export function fmtMc(value: number): string {
	return `${fmt(value, 0)} mc`
}

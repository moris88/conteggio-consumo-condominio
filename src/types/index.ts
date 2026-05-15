export type TipoCondomino =
	| 'proprietario-residente'
	| 'proprietario-non-residente'
	| 'inquilino'

export const TIPO_CONDOMINO_LABELS: Record<TipoCondomino, string> = {
	'proprietario-residente': 'Proprietario Residente',
	'proprietario-non-residente': 'Proprietario Non Residente',
	inquilino: 'Inquilino',
}

export interface Condomino {
	id: string
	nome: string
	cognome: string
	appartamento: string
	tipo: TipoCondomino
	letturaAttuale: number
	letturaPrecedente: number
}

export interface BollettaAcqua {
	dataInizio: string
	dataFine: string
	dataScadenza: string
	numeroBolletta: string
	viaCondominio: string
	dataDocumento: string
	dataProssimaLettura: string
	sogliaDiscrepanza: number
	consumoTotale: number
	quotaFissa: number
	tariffaAgevolata: number
	eccedenzaBase: number
	eccedenzaFascia1: number
	eccedenzaFascia2: number
	eccedenzaFascia3: number
	tariffaAgevolataMin: number
	eccedenzaBaseMin: number
	eccedenzaFascia1Min: number
	eccedenzaFascia2Min: number
	eccedenzaFascia3Min: number
	quotaFogna: number
	quotaDepurazione: number
	quotaPerequazione: number
	iva: number
	rettificaAcconti: number
	spesePostali: number
	speseGestione: number
}

export interface BollettaLuce {
	dataInizio: string
	dataFine: string
	dataScadenza: string
	numeroBolletta: string
	viaCondominio: string
	dataDocumento: string
	totaleBolletta: number
	spesePostali: number
	speseGestione: number
	rettificaAcconti: number
}

export interface RigaRisultato {
	condomino: Condomino
	// Campi Acqua
	consumoReale?: number
	consumoTotale?: number
	coeffProporzionale?: number
	quotaFissa?: number
	tariffaAgevolata?: number
	eccedenzaBase?: number
	eccedenzaFascia1?: number
	eccedenzaFascia2?: number
	eccedenzaFascia3?: number
	quotaFogna?: number
	quotaDepurazione?: number
	quotaPerequazione?: number
	iva?: number
	rettificaAcconti?: number
	totaleFatturaAQP?: number
	// Campi Luce / Comuni
	quotaBase?: number
	spesePostali: number
	speseGestione: number
	totaleDaPagare: number
	isNonResidente?: boolean
}

export interface TotaliRisultato {
	// Campi Acqua
	consumoReale?: number
	consumoTotale?: number
	quotaFissa?: number
	tariffaAgevolata?: number
	eccedenzaBase?: number
	eccedenzaFascia1?: number
	eccedenzaFascia2?: number
	eccedenzaFascia3?: number
	quotaFogna?: number
	quotaDepurazione?: number
	quotaPerequazione?: number
	iva?: number
	rettificaAcconti?: number
	totaleFatturaAQP?: number
	// Campi Luce / Comuni
	quotaBase?: number
	spesePostali: number
	speseGestione: number
	totaleDaPagare: number
}

export interface RisultatoCalcolo {
	righe: RigaRisultato[]
	consumoRealeTotale: number
	consumoBolletta: number
	discrepanzaMC: number
	discrepanzaPercent: number
	discrepanzaElevata: boolean
	totali: TotaliRisultato
}

export type AppStep =
	| 'condomini'
	| 'bolletta'
	| 'consumi'
	| 'risultati'
	| 'storico'

export const APP_STEPS: { id: AppStep; label: string; shortLabel: string }[] = [
	{ id: 'condomini', label: 'Condomini', shortLabel: '1' },
	{ id: 'bolletta', label: 'Bolletta', shortLabel: '2' },
	{ id: 'consumi', label: 'Consumi', shortLabel: '3' },
	{ id: 'risultati', label: 'Risultati', shortLabel: '4' },
]

export interface StoricoBolletta {
	id: string
	dataInserimento: string
	tipo: 'acqua' | 'luce'
	bolletta: BollettaAcqua | BollettaLuce
	condomini: Condomino[]
	note: string
	locked: boolean
}

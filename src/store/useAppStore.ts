import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
	AppStep,
	BollettaAcqua,
	BollettaLuce,
	Condomino,
	StoricoBolletta,
} from '@/types'

const oggi = new Date().toISOString().split('T')[0]
const treMesiFa = new Date()
treMesiFa.setMonth(treMesiFa.getMonth() - 3)

export const BOLLETTA_DEFAULT: BollettaAcqua = {
	dataInizio: treMesiFa.toISOString().split('T')[0],
	dataFine: oggi,
	dataScadenza: '',
	numeroBolletta: '',
	viaCondominio: '',
	dataDocumento: oggi,
	dataProssimaLettura: '',
	sogliaDiscrepanza: 10,
	consumoTotale: 0,
	quotaFissa: 0,
	tariffaAgevolata: 0,
	eccedenzaBase: 0,
	eccedenzaFascia1: 0,
	eccedenzaFascia2: 0,
	eccedenzaFascia3: 0,
	tariffaAgevolataMin: 0,
	eccedenzaBaseMin: 0,
	eccedenzaFascia1Min: 0,
	eccedenzaFascia2Min: 0,
	eccedenzaFascia3Min: 0,
	quotaFogna: 0,
	quotaDepurazione: 0,
	quotaPerequazione: 0,
	iva: 0,
	rettificaAcconti: 0,
	spesePostali: 0,
	speseGestione: 0,
}

export const BOLLETTA_LUCE_DEFAULT: BollettaLuce = {
	dataInizio: treMesiFa.toISOString().split('T')[0],
	dataFine: oggi,
	dataScadenza: '',
	numeroBolletta: '',
	viaCondominio: '',
	dataDocumento: oggi,
	totaleBolletta: 0,
	spesePostali: 0,
	speseGestione: 0,
	rettificaAcconti: 0,
}

interface AppStore {
	condominiAcqua: Condomino[]
	condominiLuce: Condomino[]
	bolletta: BollettaAcqua
	bollettaLuce: BollettaLuce
	type: 'acqua' | 'luce'
	activeStep: AppStep
	storico: StoricoBolletta[]
	// Actions
	addCondomino: (
		data: Omit<Condomino, 'id' | 'letturaAttuale' | 'letturaPrecedente'>,
	) => void
	updateCondomino: (id: string, updates: Partial<Condomino>) => void
	deleteCondomino: (id: string) => void
	setCondomini: (condomini: Condomino[]) => void
	setBolletta: (bolletta: BollettaAcqua) => void
	setBollettaLuce: (bollettaLuce: BollettaLuce) => void
	setType: (type: 'acqua' | 'luce') => void
	setActiveStep: (step: AppStep) => void
	reset: () => void
	svuotaStorico: () => void
	// History Actions
	salvaInStorico: (note?: string) => void
	caricaDaStorico: (id: string) => void
	eliminaDaStorico: (id: string) => void
	updateNotaStorico: (id: string, note: string) => void
	importaDati: (dati: Partial<AppStore>) => void
}

export const useAppStore = create<AppStore>()(
	persist(
		(set, get) => ({
			condominiAcqua: [],
			condominiLuce: [],
			bolletta: BOLLETTA_DEFAULT,
			bollettaLuce: BOLLETTA_LUCE_DEFAULT,
			type: 'acqua',
			activeStep: 'condomini',
			storico: [],

			addCondomino: (data) =>
				set((state) => {
					const key =
						state.type === 'acqua' ? 'condominiAcqua' : 'condominiLuce'
					return {
						[key]: [
							...state[key],
							{
								...data,
								id: crypto.randomUUID(),
								letturaAttuale: 0,
								letturaPrecedente: 0,
							},
						],
					}
				}),

			updateCondomino: (id, updates) =>
				set((state) => {
					const key =
						state.type === 'acqua' ? 'condominiAcqua' : 'condominiLuce'
					return {
						[key]: state[key].map((c: Condomino) =>
							c.id === id ? { ...c, ...updates } : c,
						),
					}
				}),

			deleteCondomino: (id) =>
				set((state) => {
					const key =
						state.type === 'acqua' ? 'condominiAcqua' : 'condominiLuce'
					return {
						[key]: state[key].filter((c: Condomino) => c.id !== id),
					}
				}),

			setCondomini: (condomini) =>
				set((state) => {
					const key =
						state.type === 'acqua' ? 'condominiAcqua' : 'condominiLuce'
					return { [key]: condomini }
				}),

			setBolletta: (bolletta) => set({ bolletta }),

			setBollettaLuce: (bollettaLuce) => set({ bollettaLuce }),

			setActiveStep: (activeStep) => set({ activeStep }),

			setType: (type) => set({ type, activeStep: 'condomini' }),

			reset: () =>
				set({
					condominiAcqua: [],
					condominiLuce: [],
					bolletta: BOLLETTA_DEFAULT,
					bollettaLuce: BOLLETTA_LUCE_DEFAULT,
					type: 'acqua',
					activeStep: 'condomini',
				}),

			svuotaStorico: () => set({ storico: [] }),

			salvaInStorico: (note = '') => {
				const state = get()
				const currentBolletta =
					state.type === 'acqua' ? state.bolletta : state.bollettaLuce
				const numero = currentBolletta.numeroBolletta

				if (!numero) return

				const id = `${state.type}-${numero}`

				const nuovaBolletta: StoricoBolletta = {
					id,
					dataInserimento: new Date().toISOString(),
					tipo: state.type,
					bolletta: currentBolletta,
					condomini:
						state.type === 'acqua' ? state.condominiAcqua : state.condominiLuce,
					note,
					locked: false,
				}

				set((state) => {
					const index = state.storico.findIndex((item) => item.id === id)
					if (index >= 0) {
						const nuovoStorico = [...state.storico]
						// Keep original insertion date when updating
						nuovaBolletta.dataInserimento = state.storico[index].dataInserimento
						nuovoStorico[index] = nuovaBolletta
						return { storico: nuovoStorico }
					}
					return { storico: [nuovaBolletta, ...state.storico] }
				})
			},

			caricaDaStorico: (id) => {
				const item = get().storico.find((s) => s.id === id)
				if (!item) return

				if (item.tipo === 'acqua') {
					set({
						type: 'acqua',
						bolletta: item.bolletta as BollettaAcqua,
						condominiAcqua: item.condomini,
						activeStep: 'risultati',
					})
				} else {
					set({
						type: 'luce',
						bollettaLuce: item.bolletta as BollettaLuce,
						condominiLuce: item.condomini,
						activeStep: 'risultati',
					})
				}
			},

			eliminaDaStorico: (id) =>
				set((state) => ({
					storico: state.storico.filter((s) => s.id !== id),
				})),

			updateNotaStorico: (id, note) =>
				set((state) => ({
					storico: state.storico.map((s) => (s.id === id ? { ...s, note } : s)),
				})),

			importaDati: (dati) => set((state) => ({ ...state, ...dati })),
		}),
		{
			name: 'condominio-acqua-v4',
			version: 4,
			migrate: (persistedState: any, version: number) => {
				if (version < 3 && persistedState && persistedState.condomini) {
					return {
						...persistedState,
						condominiAcqua: persistedState.condomini,
						condominiLuce: persistedState.condomini,
						storico: [],
					}
				}
				if (version < 4) {
					return {
						...persistedState,
						storico: [],
					}
				}
				return persistedState
			},
		},
	),
)

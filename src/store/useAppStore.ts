import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppStep, BollettaAcqua, Condomino } from '@/types'

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

interface AppStore {
	condomini: Condomino[]
	bolletta: BollettaAcqua
	activeStep: AppStep
	addCondomino: (
		data: Omit<Condomino, 'id' | 'letturaAttuale' | 'letturaPrecedente'>,
	) => void
	updateCondomino: (id: string, updates: Partial<Condomino>) => void
	deleteCondomino: (id: string) => void
	setCondomini: (condomini: Condomino[]) => void
	setBolletta: (bolletta: BollettaAcqua) => void
	setActiveStep: (step: AppStep) => void
	reset: () => void
}

export const useAppStore = create<AppStore>()(
	persist(
		(set) => ({
			condomini: [],
			bolletta: BOLLETTA_DEFAULT,
			activeStep: 'condomini',

			addCondomino: (data) =>
				set((state) => ({
					condomini: [
						...state.condomini,
						{
							...data,
							id: crypto.randomUUID(),
							letturaAttuale: 0,
							letturaPrecedente: 0,
						},
					],
				})),

			updateCondomino: (id, updates) =>
				set((state) => ({
					condomini: state.condomini.map((c) =>
						c.id === id ? { ...c, ...updates } : c,
					),
				})),

			deleteCondomino: (id) =>
				set((state) => ({
					condomini: state.condomini.filter((c) => c.id !== id),
				})),

			setCondomini: (condomini) => set({ condomini }),

			setBolletta: (bolletta) => set({ bolletta }),

			setActiveStep: (activeStep) => set({ activeStep }),

			reset: () =>
				set({
					condomini: [],
					bolletta: BOLLETTA_DEFAULT,
					activeStep: 'condomini',
				}),
		}),
		{ name: 'condominio-acqua-v2' },
	),
)

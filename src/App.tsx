import { RotateCameraRight as RotateRight } from 'iconoir-react'
import { useMemo } from 'react'

import {
	BollettaLuceStep,
	BollettaStep,
	CondominiStep,
	ConsumiStep,
	RisultatiStep,
} from '@/components'
import { Stepper } from '@/components/ui/Stepper'
import { useAppStore } from '@/store/useAppStore'
import type { AppStep } from '@/types'
import { getConsumoReale } from '@/utils/calcoli'
import { Tooltip } from './components'

export function App() {
	const {
		activeStep,
		setActiveStep,
		condomini,
		bolletta,
		bollettaLuce,
		reset,
		setType,
		type,
	} = useAppStore()

	const isAcqua = type === 'acqua'

	const completedSteps = useMemo<AppStep[]>(() => {
		const steps: AppStep[] = []
		if (condomini.length > 0) steps.push('condomini')

		if (isAcqua) {
			if (bolletta.consumoTotale > 0) steps.push('bolletta')
			const hasConsumi = condomini.some(
				(c) =>
					c.tipo !== 'proprietario-non-residente' && getConsumoReale(c) > 0,
			)
			if (hasConsumi && bolletta.consumoTotale > 0) steps.push('consumi')
		} else {
			if (bollettaLuce.totaleBolletta > 0) steps.push('bolletta')
		}

		return steps
	}, [condomini, bolletta, bollettaLuce, isAcqua])

	const tabs = [
		{ id: 'acqua', label: 'Bolletta Acqua' },
		{ id: 'luce', label: 'Bolletta Luce' },
	]

	return (
		<div className="min-h-screen bg-slate-50">
			<header className="border-slate-200 border-b bg-white shadow-sm">
				<div className="mx-auto flex items-center justify-between px-4 py-4">
					<div>
						<h1 className="font-bold text-lg text-slate-900 leading-tight">
							Gestione Consumo Condominio
						</h1>
						<p className="text-slate-500 text-xs">
							Ripartizione spese condominiali
						</p>
					</div>
					<Tooltip content="Resetta tutti i dati" placement="left">
						<button
							type="button"
							onClick={() => {
								if (
									confirm(
										"Vuoi azzerare tutti i dati? L'operazione non è reversibile.",
									)
								) {
									reset()
								}
							}}
							className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-500 text-xs transition-colors hover:bg-slate-100 hover:text-slate-700"
							title="Azzera tutto"
						>
							<RotateRight className="h-3.5 w-3.5" />
							Reset
						</button>
					</Tooltip>
				</div>
			</header>

			<main className="mx-auto max-w-full px-4 py-6">
				{tabs.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => setType(t.id as 'acqua' | 'luce')}
						className={`mr-2 mb-4 rounded-lg px-3 py-1.5 text-sm transition-colors ${
							type === t.id
								? 'bg-blue-600 text-white'
								: 'bg-slate-200 text-slate-700 hover:bg-slate-300'
						}`}
					>
						{t.label}
					</button>
				))}

				<div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
					<Stepper
						activeStep={activeStep}
						completedSteps={completedSteps}
						onStepChange={setActiveStep}
					/>
				</div>

				{activeStep === 'condomini' && <CondominiStep />}
				{activeStep === 'bolletta' &&
					(isAcqua ? <BollettaStep /> : <BollettaLuceStep />)}
				{activeStep === 'consumi' && isAcqua && <ConsumiStep />}
				{activeStep === 'risultati' && <RisultatiStep />}
			</main>
		</div>
	)
}

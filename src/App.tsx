import { RotateCameraRight as RotateRight } from 'iconoir-react'
import { useMemo } from 'react'

import { BollettaStep } from '@/components/BollettaStep'
import { CondominiStep } from '@/components/CondominiStep'
import { ConsumiStep } from '@/components/ConsumiStep'
import { RisultatiStep } from '@/components/RisultatiStep'
import { Stepper } from '@/components/ui/Stepper'
import { useAppStore } from '@/store/useAppStore'
import type { AppStep } from '@/types'
import { getConsumoReale } from '@/utils/calcoli'

export function App() {
	const { activeStep, setActiveStep, condomini, bolletta, reset } =
		useAppStore()

	const completedSteps = useMemo<AppStep[]>(() => {
		const steps: AppStep[] = []
		if (condomini.length > 0) steps.push('condomini')
		if (bolletta.consumoTotale > 0) steps.push('bolletta')
		const hasConsumi = condomini.some(
			(c) => c.tipo !== 'proprietario-non-residente' && getConsumoReale(c) > 0,
		)
		if (hasConsumi && bolletta.consumoTotale > 0) steps.push('consumi')
		return steps
	}, [condomini, bolletta])

	return (
		<div className="min-h-screen bg-slate-50">
			<header className="border-slate-200 border-b bg-white shadow-sm">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
					<div>
						<h1 className="font-bold text-lg text-slate-900 leading-tight">
							Gestione Consumo Acqua
						</h1>
						<p className="text-slate-500 text-xs">
							Ripartizione spese condominiali
						</p>
					</div>
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
						className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-500 text-xs transition-colors hover:bg-slate-100 hover:text-slate-700"
						title="Azzera tutto"
					>
						<RotateRight className="h-3.5 w-3.5" />
						Reset
					</button>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-6">
				<div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
					<Stepper
						activeStep={activeStep}
						completedSteps={completedSteps}
						onStepChange={setActiveStep}
					/>
				</div>

				{activeStep === 'condomini' && <CondominiStep />}
				{activeStep === 'bolletta' && <BollettaStep />}
				{activeStep === 'consumi' && <ConsumiStep />}
				{activeStep === 'risultati' && <RisultatiStep />}
			</main>
		</div>
	)
}

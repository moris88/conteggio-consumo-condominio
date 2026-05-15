import {
	Droplet,
	Flash,
	HistoricShield,
	Home,
	HomeSimpleDoor,
	RotateCameraRight as RotateRight,
} from 'iconoir-react'
import { useMemo } from 'react'
import {
	BollettaLuceStep,
	BollettaStep,
	CondominiStep,
	ConsumiStep,
	RisultatiStep,
	StoricoStep,
} from '@/components'
import { Stepper } from '@/components/ui/Stepper'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAppStore } from '@/store/useAppStore'
import type { AppStep } from '@/types'
import { getConsumoReale } from '@/utils/calcoli'

const TABS = [
	{ id: 'acqua', label: 'Acqua', icon: Droplet },
	{ id: 'luce', label: 'Luce Scale', icon: Flash },
] as const

export function App() {
	const type = useAppStore((s) => s.type)
	const condomini = useAppStore((s) =>
		type === 'acqua' ? s.condominiAcqua : s.condominiLuce,
	)
	const { activeStep, setActiveStep, bolletta, bollettaLuce, reset, setType } =
		useAppStore()

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

	return (
		<div className="min-h-screen bg-slate-50">
			<header className="border-slate-200 border-b bg-white shadow-sm">
				<div className="border-blue-600 border-t-4" />
				<div className="mx-auto flex items-center justify-between px-4 py-3">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
							<HomeSimpleDoor className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="font-bold text-base text-slate-900 leading-tight">
								Gestione Condominio
							</h1>
							<p className="text-slate-400 text-xs">Ripartizione spese</p>
						</div>
					</div>

					<nav className="flex items-center gap-1">
						<Tooltip content="Home — Condomini" placement="bottom">
							<button
								type="button"
								onClick={() => setActiveStep('condomini')}
								className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${
									activeStep === 'condomini'
										? 'bg-blue-50 text-blue-600'
										: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
								}`}
							>
								<Home className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Home</span>
							</button>
						</Tooltip>

						<Tooltip content="Storico bollette" placement="bottom">
							<button
								type="button"
								onClick={() => setActiveStep('storico')}
								className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${
									activeStep === 'storico'
										? 'bg-blue-50 text-blue-600'
										: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
								}`}
							>
								<HistoricShield className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Storico</span>
							</button>
						</Tooltip>

						<div className="mx-1 h-4 w-px bg-slate-200" />

						<Tooltip content="Azzera tutti i dati" placement="bottom">
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
								className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-slate-500 text-xs transition-colors hover:bg-red-50 hover:text-red-600"
							>
								<RotateRight className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Reset</span>
							</button>
						</Tooltip>
					</nav>
				</div>
			</header>

			<main className="mx-auto max-w-full px-4 py-6">
				{activeStep !== 'storico' && (
					<div className="mb-5 flex flex-wrap items-center gap-2">
						{TABS.map((t) => {
							const Icon = t.icon
							const isActive = type === t.id
							return (
								<button
									key={t.id}
									type="button"
									onClick={() => setType(t.id)}
									className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-medium text-sm shadow-xs transition-all ${
										isActive
											? 'border-blue-200 bg-blue-600 text-white shadow-blue-100'
											: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
									}`}
								>
									<Icon className="h-4 w-4" />
									{t.label}
								</button>
							)
						})}
					</div>
				)}

				{activeStep !== 'storico' && (
					<div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
						<Stepper
							activeStep={activeStep}
							completedSteps={completedSteps}
							onStepChange={setActiveStep}
						/>
					</div>
				)}

				{activeStep === 'condomini' && <CondominiStep />}
				{activeStep === 'bolletta' &&
					(isAcqua ? <BollettaStep /> : <BollettaLuceStep />)}
				{activeStep === 'consumi' && isAcqua && <ConsumiStep />}
				{activeStep === 'risultati' && <RisultatiStep />}
				{activeStep === 'storico' && <StoricoStep />}
			</main>

			<footer className="mt-8 border-slate-100 border-t bg-white py-4 text-center text-slate-400 text-xs">
				Gestione Condominio — Ripartizione spese condominiali
			</footer>
		</div>
	)
}

import { BOLLETTA_LUCE_DEFAULT, useAppStore } from '@/store/useAppStore'
import type { BollettaLuce } from '@/types'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	NumberInput,
} from './ui'

export function BollettaLuceStep() {
	const { bollettaLuce, setBollettaLuce, setActiveStep } = useAppStore()

	const set = <K extends keyof BollettaLuce>(
		key: K,
		value: BollettaLuce[K],
	) => {
		setBollettaLuce({ ...bollettaLuce, [key]: value })
	}

	const num = (key: keyof BollettaLuce) => (v: number) => set(key, v as never)

	const handleReset = () => {
		setBollettaLuce(BOLLETTA_LUCE_DEFAULT)
	}

	const isValid =
		bollettaLuce.totaleBolletta > 0 && bollettaLuce.numeroBolletta.trim() !== ''

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Periodo e Dati Fattura</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<Input
							label="Data inizio periodo"
							type="date"
							value={bollettaLuce.dataInizio}
							onChange={(e) => set('dataInizio', e.target.value)}
						/>
						<Input
							label="Data fine periodo"
							type="date"
							value={bollettaLuce.dataFine}
							onChange={(e) => set('dataFine', e.target.value)}
						/>
						<Input
							label="Data scadenza pagamento"
							type="date"
							value={bollettaLuce.dataScadenza}
							onChange={(e) => set('dataScadenza', e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							label="Numero Bolletta"
							value={bollettaLuce.numeroBolletta}
							onChange={(e) => set('numeroBolletta', e.target.value)}
							placeholder="Es. 12345678"
						/>
						<Input
							label="Via Condominio"
							value={bollettaLuce.viaCondominio}
							onChange={(e) => set('viaCondominio', e.target.value)}
							placeholder="Es. Via Roma, 123"
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							label="Data del documento"
							type="date"
							value={bollettaLuce.dataDocumento}
							onChange={(e) => set('dataDocumento', e.target.value)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Dati Economici</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<NumberInput
							label="Importo Totale Bolletta"
							value={bollettaLuce.totaleBolletta}
							onChange={num('totaleBolletta')}
							suffix="€"
							min={0}
							helper="Importo totale della fattura luce"
						/>
						<NumberInput
							label="Spese Postali / Commissioni"
							value={bollettaLuce.spesePostali}
							onChange={num('spesePostali')}
							suffix="€"
							min={0}
							helper="Divide equamente tra tutti i condomini"
						/>
						<NumberInput
							label="Spese Gestione / Cancelleria"
							value={bollettaLuce.speseGestione}
							onChange={num('speseGestione')}
							suffix="€"
							min={0}
							helper="Spese dell'amministratore"
						/>
						<NumberInput
							label="Rettifica / Acconti"
							value={bollettaLuce.rettificaAcconti}
							onChange={num('rettificaAcconti')}
							suffix="€"
							helper="Importo rettifica acconti (negativo = credito da scalare)"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<Button type="button" variant="ghost" onClick={handleReset} className="w-full sm:w-auto">
					Azzera dati bolletta
				</Button>
				<div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
					<Button
						type="button"
						variant="secondary"
						className="w-full sm:w-auto"
						onClick={() => setActiveStep('condomini')}
					>
						← Condomini
					</Button>
					<Button
						type="button"
						variant="primary"
						disabled={!isValid}
						className="w-full sm:w-auto"
						onClick={() => setActiveStep('risultati')}
					>
						Continua → Risultati
					</Button>
				</div>
			</div>
		</div>
	)
}

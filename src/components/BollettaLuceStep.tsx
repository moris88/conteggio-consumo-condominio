import { useState } from 'react'

import { BOLLETTA_LUCE_DEFAULT, useAppStore } from '@/store/useAppStore'
import type { BollettaLuce } from '@/types'
import {
	Alert,
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
	const [form, setForm] = useState<BollettaLuce>(bollettaLuce)
	const [saved, setSaved] = useState(false)

	const set = <K extends keyof BollettaLuce>(
		key: K,
		value: BollettaLuce[K],
	) => {
		setSaved(false)
		setForm((p) => ({ ...p, [key]: value }))
	}

	const num = (key: keyof BollettaLuce) => (v: number) => set(key, v as never)

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		setBollettaLuce(form)
		setSaved(true)
	}

	const handleReset = () => {
		setForm(BOLLETTA_LUCE_DEFAULT)
		setSaved(false)
	}

	const isValid = form.totaleBolletta > 0

	return (
		<form onSubmit={handleSave} className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Periodo e Dati Fattura</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<Input
							label="Data inizio periodo"
							type="date"
							value={form.dataInizio}
							onChange={(e) => set('dataInizio', e.target.value)}
						/>
						<Input
							label="Data fine periodo"
							type="date"
							value={form.dataFine}
							onChange={(e) => set('dataFine', e.target.value)}
						/>
						<Input
							label="Data scadenza pagamento"
							type="date"
							value={form.dataScadenza}
							onChange={(e) => set('dataScadenza', e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							label="Numero Bolletta"
							value={form.numeroBolletta}
							onChange={(e) => set('numeroBolletta', e.target.value)}
							placeholder="Es. 12345678"
						/>
						<Input
							label="Via Condominio"
							value={form.viaCondominio}
							onChange={(e) => set('viaCondominio', e.target.value)}
							placeholder="Es. Via Roma, 123"
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							label="Data del documento"
							type="date"
							value={form.dataDocumento}
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
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<NumberInput
							label="Importo Totale Bolletta"
							value={form.totaleBolletta}
							onChange={num('totaleBolletta')}
							suffix="€"
							min={0}
							helper="Importo totale della fattura luce"
						/>
						<NumberInput
							label="Spese Postali / Commissioni"
							value={form.spesePostali}
							onChange={num('spesePostali')}
							suffix="€"
							min={0}
							helper="Divide equamente tra tutti i condomini"
						/>
						<NumberInput
							label="Spese Gestione / Cancelleria"
							value={form.speseGestione}
							onChange={num('speseGestione')}
							suffix="€"
							min={0}
							helper="Spese dell'amministratore"
						/>
					</div>
				</CardContent>
			</Card>

			{saved && (
				<Alert variant="success">Dati bolletta salvati correttamente.</Alert>
			)}

			<div className="flex flex-wrap items-center justify-between gap-3">
				<Button type="button" variant="ghost" onClick={handleReset}>
					Azzera dati bolletta
				</Button>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="secondary"
						onClick={() => setActiveStep('condomini')}
					>
						← Condomini
					</Button>
					<Button type="submit" disabled={!isValid}>
						Salva bolletta
					</Button>
					{saved && (
						<Button
							type="button"
							variant="success"
							onClick={() => setActiveStep('risultati')}
						>
							Continua → Risultati
						</Button>
					)}
				</div>
			</div>
		</form>
	)
}

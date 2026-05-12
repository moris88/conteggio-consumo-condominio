import { useState } from 'react'

import { BOLLETTA_DEFAULT, useAppStore } from '@/store/useAppStore'
import type { BollettaAcqua } from '@/types'
import {
	Alert,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	NumberInput,
	Separator,
} from './ui'

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<p className="mb-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
			{children}
		</p>
	)
}

export function BollettaStep() {
	const { bolletta, setBolletta, setActiveStep } = useAppStore()
	const [form, setForm] = useState<BollettaAcqua>(bolletta)
	const [saved, setSaved] = useState(false)

	const set = <K extends keyof BollettaAcqua>(
		key: K,
		value: BollettaAcqua[K],
	) => {
		setSaved(false)
		setForm((p) => ({ ...p, [key]: value }))
	}

	const num = (key: keyof BollettaAcqua) => (v: number) => set(key, v as never)

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		setBolletta(form)
		setSaved(true)
	}

	const handleReset = () => {
		setForm(BOLLETTA_DEFAULT)
		setSaved(false)
	}

	const isValid = form.consumoTotale > 0

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
						<Input
							label="Data prossima lettura"
							type="date"
							value={form.dataProssimaLettura}
							onChange={(e) => set('dataProssimaLettura', e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<NumberInput
							label="Consumo totale dichiarato in bolletta"
							value={form.consumoTotale}
							onChange={num('consumoTotale')}
							suffix="mc"
							min={0}
							step={1}
							helper="Metri cubi indicati nella fattura AQP"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Quote Fisse</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<NumberInput
							label="Quota fissa totale"
							value={form.quotaFissa}
							onChange={num('quotaFissa')}
							suffix="€"
							min={0}
							helper="Importo quota fissa dalla bolletta (verrà diviso equamente)"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Tariffe Variabili</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<SectionTitle>
						Quote variabili acqua (importi totali dalla bolletta)
					</SectionTitle>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<NumberInput
							label="Tariffa Agevolata"
							value={form.tariffaAgevolata}
							onChange={num('tariffaAgevolata')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza Tariffa Base"
							value={form.eccedenzaBase}
							onChange={num('eccedenzaBase')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza 1° Fascia"
							value={form.eccedenzaFascia1}
							onChange={num('eccedenzaFascia1')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza 2° Fascia"
							value={form.eccedenzaFascia2}
							onChange={num('eccedenzaFascia2')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza 3° Fascia"
							value={form.eccedenzaFascia3}
							onChange={num('eccedenzaFascia3')}
							suffix="€"
							min={0}
						/>
					</div>
					<Separator />
					<SectionTitle>
						Quote variabili fogna, depurazione e perequazione
					</SectionTitle>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<NumberInput
							label="Quota Variabile Fogna"
							value={form.quotaFogna}
							onChange={num('quotaFogna')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Quota Variabile Depurazione"
							value={form.quotaDepurazione}
							onChange={num('quotaDepurazione')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Quota Variabile Perequazione"
							value={form.quotaPerequazione}
							onChange={num('quotaPerequazione')}
							suffix="€"
							min={0}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>IVA, Rettifiche e Spese</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<NumberInput
							label="IVA 10% (importo totale)"
							value={form.iva}
							onChange={num('iva')}
							suffix="€"
							min={0}
							helper="Importo IVA dalla bolletta"
						/>
						<NumberInput
							label="Rettifica / Acconti"
							value={form.rettificaAcconti}
							onChange={num('rettificaAcconti')}
							suffix="€"
							helper="Importo rettifica acconti (positivo = credito da scalare)"
						/>
						<NumberInput
							label="Spese Postali (totale)"
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
							helper="Spese dell'amministratore (cancelleria, ecc.)"
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
							onClick={() => setActiveStep('consumi')}
						>
							Continua → Consumi
						</Button>
					)}
				</div>
			</div>
		</form>
	)
}

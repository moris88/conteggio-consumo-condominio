import { BOLLETTA_DEFAULT, useAppStore } from '@/store/useAppStore'
import type { BollettaAcqua } from '@/types'
import {
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

	const set = <K extends keyof BollettaAcqua>(
		key: K,
		value: BollettaAcqua[K],
	) => {
		setBolletta({ ...bolletta, [key]: value })
	}

	const num = (key: keyof BollettaAcqua) => (v: number) => set(key, v as never)

	const handleReset = () => {
		setBolletta(BOLLETTA_DEFAULT)
	}

	const isValid =
		bolletta.consumoTotale > 0 && bolletta.numeroBolletta.trim() !== ''

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
							value={bolletta.dataInizio}
							onChange={(e) => set('dataInizio', e.target.value)}
						/>
						<Input
							label="Data fine periodo"
							type="date"
							value={bolletta.dataFine}
							onChange={(e) => set('dataFine', e.target.value)}
						/>
						<Input
							label="Data scadenza pagamento"
							type="date"
							value={bolletta.dataScadenza}
							onChange={(e) => set('dataScadenza', e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							label="Numero Bolletta"
							value={bolletta.numeroBolletta}
							onChange={(e) => set('numeroBolletta', e.target.value)}
							placeholder="Es. 12345678"
						/>
						<Input
							label="Via Condominio"
							value={bolletta.viaCondominio}
							onChange={(e) => set('viaCondominio', e.target.value)}
							placeholder="Es. Via Roma, 123"
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Input
							label="Data del documento"
							type="date"
							value={bolletta.dataDocumento}
							onChange={(e) => set('dataDocumento', e.target.value)}
						/>
						<Input
							label="Data prossima lettura"
							type="date"
							value={bolletta.dataProssimaLettura}
							onChange={(e) => set('dataProssimaLettura', e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<NumberInput
							label="Consumo totale dichiarato in bolletta"
							value={bolletta.consumoTotale}
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
							value={bolletta.quotaFissa}
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
							value={bolletta.tariffaAgevolata}
							onChange={num('tariffaAgevolata')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza Tariffa Base"
							value={bolletta.eccedenzaBase}
							onChange={num('eccedenzaBase')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza 1° Fascia"
							value={bolletta.eccedenzaFascia1}
							onChange={num('eccedenzaFascia1')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza 2° Fascia"
							value={bolletta.eccedenzaFascia2}
							onChange={num('eccedenzaFascia2')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Eccedenza 3° Fascia"
							value={bolletta.eccedenzaFascia3}
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
							value={bolletta.quotaFogna}
							onChange={num('quotaFogna')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Quota Variabile Depurazione"
							value={bolletta.quotaDepurazione}
							onChange={num('quotaDepurazione')}
							suffix="€"
							min={0}
						/>
						<NumberInput
							label="Quota Variabile Perequazione"
							value={bolletta.quotaPerequazione}
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
							value={bolletta.iva}
							onChange={num('iva')}
							suffix="€"
							min={0}
							helper="Importo IVA dalla bolletta"
						/>
						<NumberInput
							label="Rettifica / Acconti"
							value={bolletta.rettificaAcconti}
							onChange={num('rettificaAcconti')}
							suffix="€"
							helper="Importo rettifica acconti (negativo = credito da scalare)"
						/>
						<NumberInput
							label="Spese Postali (totale)"
							value={bolletta.spesePostali}
							onChange={num('spesePostali')}
							suffix="€"
							min={0}
							helper="Divide equamente tra tutti i condomini"
						/>
						<NumberInput
							label="Spese Gestione / Cancelleria"
							value={bolletta.speseGestione}
							onChange={num('speseGestione')}
							suffix="€"
							min={0}
							helper="Spese dell'amministratore (cancelleria, ecc.)"
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
						onClick={() => setActiveStep('consumi')}
					>
						Continua → Consumi
					</Button>
				</div>
			</div>
		</div>
	)
}

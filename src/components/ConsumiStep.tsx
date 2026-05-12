import { HomeSimple, User, UserBadgeCheck } from 'iconoir-react'

import { useAppStore } from '@/store/useAppStore'
import { getConsumoReale } from '@/utils/calcoli'
import {
	Alert,
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	NumberInput,
	Select,
	Separator,
} from './ui'

export function ConsumiStep() {
	const { condomini, bolletta, setBolletta, updateCondomino, setActiveStep } =
		useAppStore()

	if (condomini.length === 0) {
		return (
			<Alert variant="warning" title="Nessun condomino">
				Aggiungi prima i condomini nel primo step.{' '}
				<button
					type="button"
					className="font-medium underline"
					onClick={() => setActiveStep('condomini')}
				>
					Vai a Condomini
				</button>
			</Alert>
		)
	}

	const isReady = bolletta.consumoTotale > 0

	const SOGLIE_DISCREPANZA = [5, 10, 15, 20, 25, 30, 50].map((s) => ({
		value: s.toString(),
		label: `${s}%`,
	}))

	return (
		<div className="flex flex-col gap-6">
			{!isReady && (
				<Alert variant="warning" title="Bolletta non configurata">
					Inserisci prima i dati della bolletta.{' '}
					<button
						type="button"
						className="font-medium underline"
						onClick={() => setActiveStep('bolletta')}
					>
						Vai a Bolletta
					</button>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Configurazione e Letture</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="px-5 pt-4">
						<Select
							label="Soglia discrepanza elevata"
							options={SOGLIE_DISCREPANZA}
							value={bolletta.sogliaDiscrepanza.toString()}
							onChange={(e) =>
								setBolletta({
									...bolletta,
									sogliaDiscrepanza: Number.parseInt(e.target.value, 10),
								})
							}
							className="max-w-xs"
						/>
					</div>

					<Separator />

					<div className="divide-y divide-slate-100">
						{condomini.map((c) => {
							const consumo = getConsumoReale(c)
							const isNR = c.tipo === 'proprietario-non-residente'
							return (
								<div key={c.id} className="px-5 py-4">
									<div className="mb-3 flex items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
											{isNR ? (
												<UserBadgeCheck className="h-5 w-5 text-slate-500" />
											) : (
												<User className="h-5 w-5 text-slate-500" />
											)}
										</div>
										<div>
											<p className="font-medium text-slate-900 text-sm">
												{c.cognome} {c.nome}
											</p>
											<div className="mt-0.5 flex items-center gap-2">
												<span className="flex items-center gap-1 text-slate-500 text-xs">
													<HomeSimple className="h-3 w-3" />
													{c.appartamento}
												</span>
												{isNR && (
													<Badge variant="purple">
														Non residente — nessuna lettura
													</Badge>
												)}
											</div>
										</div>
										{!isNR && (
											<div className="ml-auto shrink-0">
												<span
													className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold text-sm ${
														consumo > 0
															? 'bg-blue-100 text-blue-700'
															: 'bg-slate-100 text-slate-500'
													}`}
												>
													{consumo} mc
												</span>
											</div>
										)}
									</div>

									{!isNR && (
										<div className="grid grid-cols-1 gap-3 pl-12 sm:grid-cols-2">
											<NumberInput
												label="Lettura precedente"
												value={c.letturaPrecedente}
												onChange={(v) =>
													updateCondomino(c.id, { letturaPrecedente: v })
												}
												suffix="mc"
												min={0}
												step={1}
												placeholder="0"
											/>
											<NumberInput
												label={`Lettura attuale${bolletta.dataFine ? ` (${new Date(bolletta.dataFine).toLocaleDateString('it-IT')})` : ''}`}
												value={c.letturaAttuale}
												onChange={(v) =>
													updateCondomino(c.id, { letturaAttuale: v })
												}
												suffix="mc"
												min={0}
												step={1}
												placeholder="0"
											/>
										</div>
									)}
								</div>
							)
						})}
					</div>
				</CardContent>
				<CardFooter>
					<Button variant="secondary" onClick={() => setActiveStep('bolletta')}>
						← Bolletta
					</Button>
					<Button
						disabled={!isReady}
						onClick={() => setActiveStep('risultati')}
					>
						Calcola Risultati →
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}

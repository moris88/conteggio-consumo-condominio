import { Check, Download, Eye, Notes, Trash, Upload } from 'iconoir-react'
import { useMemo, useState } from 'react'

import { Badge, Button, Card, Select } from '@/components/ui'
import { useAppStore } from '@/store/useAppStore'
import type { StoricoBolletta } from '@/types'

export function StoricoStep() {
	const {
		storico,
		caricaDaStorico,
		eliminaDaStorico,
		updateNotaStorico,
		importaDati,
	} = useAppStore()
	const [editingId, setEditingId] = useState<string | null>(null)
	const [tempNote, setTempNote] = useState('')
	const [sortBy, setSortBy] = useState<'data' | 'numero' | 'tipo'>('data')

	const sortedStorico = useMemo(() => {
		return [...storico].sort((a, b) => {
			if (sortBy === 'data') {
				return (
					new Date(b.dataInserimento).getTime() -
					new Date(a.dataInserimento).getTime()
				)
			}
			if (sortBy === 'numero') {
				const numA = (a.bolletta as any).numeroBolletta || ''
				const numB = (b.bolletta as any).numeroBolletta || ''
				return numA.localeCompare(numB)
			}
			if (sortBy === 'tipo') {
				return a.tipo.localeCompare(b.tipo)
			}
			return 0
		})
	}, [storico, sortBy])

	const handleExport = () => {
		const fullState = useAppStore.getState()
		const dataStr = JSON.stringify(fullState, null, 2)
		const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

		const exportFileDefaultName = `storico-bollette-${new Date().toISOString().split('T')[0]}.json`

		const linkElement = document.createElement('a')
		linkElement.setAttribute('href', dataUri)
		linkElement.setAttribute('download', exportFileDefaultName)
		linkElement.click()
	}

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = (event) => {
			try {
				const json = JSON.parse(event.target?.result as string)
				if (confirm('Vuoi sovrascrivere i dati attuali con quelli del file?')) {
					importaDati(json)
				}
			} catch (_error) {
				alert(
					'Errore nel caricamento del file. Assicurati che sia un JSON valido.',
				)
			}
		}
		reader.readAsText(file)
	}

	const isLocked = (item: StoricoBolletta) => {
		const dataIns = new Date(item.dataInserimento)
		const oggi = new Date()
		const diffTime = Math.abs(oggi.getTime() - dataIns.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays > 7
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<h2 className="font-bold text-2xl text-slate-800">Storico Bollette</h2>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex w-full items-center gap-2 sm:w-auto">
						<span className="text-nowrap font-medium text-slate-500 text-xs uppercase">
							Ordina per:
						</span>
						<Select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as any)}
							options={[
								{ value: 'data', label: 'Data Inserimento' },
								{ value: 'numero', label: 'Numero Bolletta' },
								{ value: 'tipo', label: 'Tipo (Acqua/Luce)' },
							]}
							className="h-8 flex-1 py-0 text-xs sm:min-w-37.5 sm:flex-none"
						/>
					</div>
					<label className="cursor-pointer">
						<input
							type="file"
							className="hidden"
							accept=".json"
							onChange={handleImport}
						/>
						<div className="inline-flex h-8 cursor-pointer select-none items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 font-medium text-slate-700 text-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
							<Upload className="h-4 w-4" />
							Importa JSON
						</div>
					</label>
					<Button variant="outline" size="sm" onClick={handleExport}>
						<Download className="mr-2 h-4 w-4" />
						Esporta tutto
					</Button>
				</div>
			</div>

			<div className="grid gap-4">
				{sortedStorico.length === 0 ? (
					<Card className="flex flex-col items-center justify-center py-12 text-slate-500">
						<Check className="mb-4 h-12 w-12 opacity-20" />
						<p>Nessuna bolletta salvata nello storico.</p>
					</Card>
				) : (
					sortedStorico.map((item) => (
						<Card key={item.id} className="p-4">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<Badge variant="default">{item.tipo.toUpperCase()}</Badge>
										<span className="font-medium text-slate-900">
											Bolletta n. {(item.bolletta as any).numeroBolletta || '—'}
										</span>
										{isLocked(item) && <Badge variant="amber">Bloccata</Badge>}
									</div>
									<div className="text-slate-500 text-sm">
										Inserita il:{' '}
										{new Date(item.dataInserimento).toLocaleString()}
									</div>
									<div className="text-slate-600 text-sm italic">
										{editingId === item.id ? (
											<div className="mt-2 flex flex-col gap-2">
												<textarea
													value={tempNote}
													onChange={(e) => setTempNote(e.target.value)}
													className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder="Aggiungi una nota..."
													rows={3}
												/>
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														variant="secondary"
														onClick={() => setEditingId(null)}
													>
														Annulla
													</Button>
													<Button
														size="sm"
														variant="primary"
														onClick={() => {
															updateNotaStorico(item.id, tempNote)
															setEditingId(null)
														}}
													>
														Salva
													</Button>
												</div>
											</div>
										) : (
											<button
												type="button"
												className="group flex cursor-pointer items-center gap-2"
												onClick={() => {
													setEditingId(item.id)
													setTempNote(item.note)
												}}
											>
												<Notes className="h-4 w-4 text-slate-400" />
												<span>{item.note || 'Aggiungi una nota...'}</span>
											</button>
										)}
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => caricaDaStorico(item.id)}
									>
										<Eye className="mr-2 h-4 w-4" />
										Visualizza
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
										aria-label="Elimina"
										onClick={() => {
											if (
												confirm(
													'Sei sicuro di voler eliminare questa bolletta dallo storico?',
												)
											) {
												eliminaDaStorico(item.id)
											}
										}}
									>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</Card>
					))
				)}
			</div>
		</div>
	)
}

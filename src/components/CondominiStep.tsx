import {
	Download,
	EditPencil,
	HomeSimple,
	Plus,
	Trash,
	Upload,
	User,
	UserBadgeCheck,
} from 'iconoir-react'
import { useRef, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'
import type { Condomino, TipoCondomino } from '@/types'
import { TIPO_CONDOMINO_LABELS } from '@/types'
import {
	Alert,
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Input,
	Select,
	Separator,
} from './ui'

const TIPO_OPTIONS = Object.entries(TIPO_CONDOMINO_LABELS).map(
	([value, label]) => ({
		value,
		label,
	}),
)

const TIPO_BADGE_COLOR: Record<TipoCondomino, 'blue' | 'green' | 'purple'> = {
	'proprietario-residente': 'blue',
	inquilino: 'green',
	'proprietario-non-residente': 'purple',
}

const emptyForm = {
	nome: '',
	cognome: '',
	appartamento: '',
	tipo: 'proprietario-residente' as TipoCondomino,
}

interface CondominiFormData {
	nome: string
	cognome: string
	appartamento: string
	tipo: TipoCondomino
}

interface EditModalProps {
	condomino: Condomino
	onSave: (updates: Partial<Condomino>) => void
	onClose: () => void
}

function EditModal({ condomino, onSave, onClose }: EditModalProps) {
	const [form, setForm] = useState<CondominiFormData>({
		nome: condomino.nome,
		cognome: condomino.cognome,
		appartamento: condomino.appartamento,
		tipo: condomino.tipo,
	})

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>
			<Card className="relative z-10 w-full max-w-md">
				<CardHeader
					actions={
						<Button variant="ghost" size="icon-sm" onClick={onClose}>
							✕
						</Button>
					}
				>
					<CardTitle>Modifica Condomino</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid grid-cols-2 gap-3">
						<Input
							label="Cognome"
							value={form.cognome}
							onChange={(e) =>
								setForm((p) => ({ ...p, cognome: e.target.value }))
							}
						/>
						<Input
							label="Nome"
							value={form.nome}
							onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
						/>
					</div>
					<Input
						label="Appartamento"
						value={form.appartamento}
						onChange={(e) =>
							setForm((p) => ({ ...p, appartamento: e.target.value }))
						}
					/>
					<Select
						label="Tipo"
						value={form.tipo}
						options={TIPO_OPTIONS}
						onChange={(e) =>
							setForm((p) => ({ ...p, tipo: e.target.value as TipoCondomino }))
						}
					/>
				</CardContent>
				<CardFooter>
					<Button variant="secondary" onClick={onClose}>
						Annulla
					</Button>
					<Button
						onClick={() => {
							onSave(form)
							onClose()
						}}
						disabled={!form.cognome.trim() || !form.appartamento.trim()}
					>
						Salva
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}

export function CondominiStep() {
	const type = useAppStore((s) => s.type)
	const condomini = useAppStore((s) =>
		type === 'acqua' ? s.condominiAcqua : s.condominiLuce,
	)
	const {
		addCondomino,
		updateCondomino,
		deleteCondomino,
		setCondomini,
		setActiveStep,
	} = useAppStore()
	const [form, setForm] = useState<CondominiFormData>(emptyForm)
	const [errors, setErrors] = useState<Partial<CondominiFormData>>({})
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const validate = (): boolean => {
		const e: Partial<CondominiFormData> = {}
		if (!form.cognome.trim()) e.cognome = 'Campo obbligatorio'
		if (!form.appartamento.trim()) e.appartamento = 'Campo obbligatorio'
		setErrors(e)
		return Object.keys(e).length === 0
	}

	const handleAdd = (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return
		addCondomino({
			nome: form.nome.trim(),
			cognome: form.cognome.trim(),
			appartamento: form.appartamento.trim(),
			tipo: form.tipo,
		})
		setForm(emptyForm)
		setErrors({})
	}

	const handleExportJSON = () => {
		const data = JSON.stringify(condomini, null, 2)
		const blob = new Blob([data], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'condomini.json'
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string
				const imported = JSON.parse(content) as Condomino[]
				if (Array.isArray(imported)) {
					setCondomini(imported)
				}
			} catch (_err) {
				alert("Errore durante l'importazione del file JSON.")
			}
		}
		reader.readAsText(file)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const editingCondomino = editingId
		? condomini.find((c) => c.id === editingId)
		: null

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader
					actions={
						<div className="flex gap-2">
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleImportJSON}
								accept=".json"
								className="hidden"
							/>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
							>
								<Upload className="h-4 w-4" />
								Importa
							</Button>
							{condomini.length > 0 && (
								<Button variant="ghost" size="sm" onClick={handleExportJSON}>
									<Download className="h-4 w-4" />
									Esporta
								</Button>
							)}
						</div>
					}
				>
					<CardTitle>Aggiungi Condomino</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleAdd} className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<Input
								label="Cognome *"
								value={form.cognome}
								onChange={(e) =>
									setForm((p) => ({ ...p, cognome: e.target.value }))
								}
								error={errors.cognome}
								placeholder="Es. Rossi"
							/>
							<Input
								label="Nome"
								value={form.nome}
								onChange={(e) =>
									setForm((p) => ({ ...p, nome: e.target.value }))
								}
								placeholder="Es. Mario"
							/>
							<Input
								label="Appartamento *"
								value={form.appartamento}
								onChange={(e) =>
									setForm((p) => ({ ...p, appartamento: e.target.value }))
								}
								error={errors.appartamento}
								placeholder="Es. A1, Piano 2"
							/>
							<Select
								label="Tipo"
								value={form.tipo}
								options={TIPO_OPTIONS}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										tipo: e.target.value as TipoCondomino,
									}))
								}
							/>
						</div>
						<div className="flex justify-end">
							<Button type="submit" size="md">
								<Plus className="h-4 w-4" />
								Aggiungi
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{condomini.length === 0 ? (
				<Alert variant="info">
					Nessun condomino inserito. Aggiungi i condomini per procedere.
				</Alert>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Condomini ({condomini.length})</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y divide-slate-100">
							{condomini.map((c) => (
								<div key={c.id} className="flex items-center gap-3 px-5 py-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
										{c.tipo === 'proprietario-non-residente' ? (
											<UserBadgeCheck className="h-5 w-5 text-slate-500" />
										) : (
											<User className="h-5 w-5 text-slate-500" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-slate-900 text-sm">
											{c.cognome} {c.nome}
										</p>
										<div className="mt-0.5 flex items-center gap-2">
											<span className="flex items-center gap-1 text-slate-500 text-xs">
												<HomeSimple className="h-3 w-3" />
												{c.appartamento}
											</span>
											<Badge variant={TIPO_BADGE_COLOR[c.tipo]}>
												{TIPO_CONDOMINO_LABELS[c.tipo]}
											</Badge>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setEditingId(c.id)}
											aria-label="Modifica"
										>
											<EditPencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeleteId(c.id)}
											aria-label="Elimina"
											className="text-red-500 hover:bg-red-50 hover:text-red-700"
										>
											<Trash className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
					{condomini.length > 0 && (
						<CardFooter>
							<Button onClick={() => setActiveStep('bolletta')}>
								Continua → Bolletta
							</Button>
						</CardFooter>
					)}
				</Card>
			)}

			{deleteId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setDeleteId(null)}
						aria-hidden="true"
					/>
					<Card className="relative z-10 w-full max-w-sm">
						<CardHeader>
							<CardTitle>Conferma eliminazione</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-slate-600 text-sm">
								Sei sicuro di voler eliminare questo condomino? L'operazione non
								è reversibile.
							</p>
						</CardContent>
						<CardFooter>
							<Button variant="secondary" onClick={() => setDeleteId(null)}>
								Annulla
							</Button>
							<Button
								variant="danger"
								onClick={() => {
									deleteCondomino(deleteId)
									setDeleteId(null)
								}}
							>
								Elimina
							</Button>
						</CardFooter>
					</Card>
				</div>
			)}

			{editingCondomino && (
				<EditModal
					condomino={editingCondomino}
					onSave={(updates) => updateCondomino(editingCondomino.id, updates)}
					onClose={() => setEditingId(null)}
				/>
			)}

			<Separator />
		</div>
	)
}

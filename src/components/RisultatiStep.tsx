import { Download, Printer } from 'iconoir-react'
import { useMemo, useRef, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'
import type { RigaRisultato } from '@/types'
import { calcolaRisultati, fmt, fmtEur } from '@/utils/calcoli'
import { exportToCSV, exportToPDF, generatePDFBlobUrl } from '@/utils/esporta'
import {
	Alert,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Modal,
	Tooltip,
} from './ui'

function TCell({
	children,
	bold,
	highlight,
	red,
}: {
	children: React.ReactNode
	bold?: boolean
	highlight?: boolean
	red?: boolean
}) {
	return (
		<td
			className={`whitespace-nowrap border border-slate-300 px-2 py-1.5 text-right text-xs ${
				bold ? 'font-semibold' : ''
			} ${highlight ? 'bg-green-100 font-bold' : ''} ${red ? 'bg-red-100 text-red-700' : ''}`}
		>
			{children}
		</td>
	)
}

function THead({ children }: { children: React.ReactNode }) {
	return (
		<th className="whitespace-wrap border border-slate-300 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-700 text-xs">
			{children}
		</th>
	)
}

function RigaTabella({ riga }: { riga: RigaRisultato }) {
	const quotaServizioAquedotto =
		riga.tariffaAgevolata +
		riga.eccedenzaBase +
		riga.eccedenzaFascia1 +
		riga.eccedenzaFascia2 +
		riga.eccedenzaFascia3
	const quotaServizi =
		riga.quotaFogna + riga.quotaDepurazione + riga.quotaPerequazione
	return (
		<tr className="hover:bg-slate-50">
			<td className="whitespace-nowrap border border-slate-300 px-2 py-1.5 font-medium text-slate-900 text-xs">
				{riga.condomino.cognome} {riga.condomino.nome}
				<br />
				<span className="font-normal text-slate-500">
					{riga.condomino.appartamento}
				</span>
			</td>
			<TCell>
				{riga.condomino.letturaAttuale > 0
					? riga.condomino.letturaPrecedente
					: '—'}
			</TCell>
			<TCell>
				{riga.condomino.letturaAttuale > 0
					? riga.condomino.letturaAttuale
					: '—'}
			</TCell>
			<TCell bold>{riga.consumoReale}</TCell>
			<TCell highlight>{riga.consumoTotale}</TCell>
			<TCell>{fmtEur(riga.quotaFissa)}</TCell>
			<TCell>{fmtEur(riga.tariffaAgevolata)}</TCell>
			<TCell>{fmtEur(riga.eccedenzaBase)}</TCell>
			<TCell>{fmtEur(riga.eccedenzaFascia1)}</TCell>
			<TCell>{fmtEur(riga.eccedenzaFascia2)}</TCell>
			<TCell>{fmtEur(riga.eccedenzaFascia3)}</TCell>
			<TCell>{fmtEur(quotaServizioAquedotto)}</TCell>
			<TCell>{fmtEur(quotaServizi)}</TCell>
			<TCell bold>{fmtEur(riga.totaleParziale)}</TCell>
			<TCell>{fmtEur(riga.iva)}</TCell>
			<TCell>
				{riga.rettificaAcconti !== 0 ? fmtEur(riga.rettificaAcconti) : '—'}
			</TCell>
			<TCell bold highlight>
				{fmtEur(riga.totaleFatturaAQP)}
			</TCell>
			<TCell>{fmtEur(riga.spesePostali)}</TCell>
			<TCell highlight>{fmtEur(riga.totaleDaPagare)}</TCell>
			<TCell>{riga.speseGestione > 0 ? fmtEur(riga.speseGestione) : '—'}</TCell>
		</tr>
	)
}

export function RisultatiStep() {
	const { condomini, bolletta, setActiveStep } = useAppStore()
	const tableRef = useRef<HTMLDivElement>(null)
	const [pdfUrl, setPdfUrl] = useState<string | null>(null)
	const [loadingPdf, setLoadingPdf] = useState(false)

	const risultato = useMemo(() => {
		if (condomini.length === 0 || bolletta.consumoTotale === 0) return null
		return calcolaRisultati(condomini, bolletta)
	}, [condomini, bolletta])

	if (!risultato) {
		return (
			<Alert variant="warning" title="Dati insufficienti">
				Inserisci i condomini e i dati della bolletta per calcolare i risultati.
			</Alert>
		)
	}

	const t = risultato.totali
	const totaliServizioAquedotto =
		t.tariffaAgevolata +
		t.eccedenzaBase +
		t.eccedenzaFascia1 +
		t.eccedenzaFascia2 +
		t.eccedenzaFascia3
	const totaliServiziString = `${fmtEur(t.quotaFogna)} / ${fmtEur(t.quotaDepurazione)} / ${fmtEur(t.quotaPerequazione)}`
	const totaliServizi = t.quotaFogna + t.quotaDepurazione + t.quotaPerequazione

	const handlePreviewPDF = async () => {
		setLoadingPdf(true)
		const url = await generatePDFBlobUrl(tableRef)
		setPdfUrl(url)
		setLoadingPdf(false)
	}

	const handleDownloadPDF = async () => {
		if (!bolletta.dataScadenza) {
			alert('Imposta una data di scadenza nella bolletta per esportare il PDF.')
			return
		}
		await exportToPDF(tableRef, bolletta.dataScadenza)
	}

	const handleDownloadCSV = () => {
		exportToCSV(risultato, bolletta)
	}

	return (
		<div className="flex flex-col gap-6">
			{risultato.discrepanzaElevata && (
				<Alert variant="error" title="Discrepanza elevata">
					La discrepanza tra consumo reale ({risultato.consumoRealeTotale} mc) e
					consumo dichiarato in bolletta ({risultato.consumoBolletta} mc) è del{' '}
					<strong>{fmt(risultato.discrepanzaPercent, 1)}%</strong> (
					{risultato.discrepanzaMC > 0 ? '+' : ''}
					{risultato.discrepanzaMC} mc), superiore al{' '}
					{bolletta.sogliaDiscrepanza}
					%.
				</Alert>
			)}

			{!risultato.discrepanzaElevata && risultato.discrepanzaMC !== 0 && (
				<Alert variant="info">
					Discrepanza: <strong>{fmt(risultato.discrepanzaPercent, 1)}%</strong>{' '}
					({risultato.discrepanzaMC > 0 ? '+' : ''}
					{risultato.discrepanzaMC} mc tra consumo bolletta e letture
					individuali).
				</Alert>
			)}

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<Card className="p-4">
					<p className="text-slate-500 text-xs">Consumo bolletta</p>
					<p className="font-bold text-slate-900 text-xl">
						{risultato.consumoBolletta} mc
					</p>
				</Card>
				<Card className="p-4">
					<p className="text-slate-500 text-xs">Consumo reale totale</p>
					<p className="font-bold text-slate-900 text-xl">
						{risultato.consumoRealeTotale} mc
					</p>
				</Card>
				<Card className="p-4">
					<p className="text-slate-500 text-xs">Discrepanza</p>
					<p
						className={`font-bold text-xl ${risultato.discrepanzaElevata ? 'text-red-600' : 'text-slate-900'}`}
					>
						{fmt(risultato.discrepanzaPercent, 1)}%
					</p>
				</Card>
				<Card className="p-4">
					<p className="text-slate-500 text-xs">Totale da pagare</p>
					<p className="font-bold text-green-700 text-xl">
						{fmtEur(t.totaleDaPagare)}
					</p>
				</Card>
			</div>

			<Card>
				<CardHeader
					actions={
						<div className="flex flex-col flex-wrap gap-2 md:flex-row">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => setActiveStep('consumi')}
							>
								← Consumi
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={handlePreviewPDF}
								disabled={loadingPdf}
							>
								<Printer className="h-3.5 w-3.5" />
								{loadingPdf ? 'Caricamento...' : 'Anteprima PDF'}
							</Button>
							{/* <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
								<Page className="h-3.5 w-3.5" />
								PDF
							</Button> */}
							<Button variant="secondary" size="sm" onClick={handleDownloadCSV}>
								<Download className="h-3.5 w-3.5" />
								CSV
							</Button>
						</div>
					}
				>
					<CardTitle>Tabella Ripartizione</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div ref={tableRef} className="overflow-x-auto bg-white p-4">
						<div className="mb-8 flex justify-between border-slate-200 border-b pb-3">
							<div className="mb-4 flex flex-col gap-4">
								<h2 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">
									Ripartizione Consumo Acqua
								</h2>
								{bolletta.viaCondominio && (
									<p className="mt-1 font-bold text-slate-700 text-sm">
										<span className="mr-2 text-[10px] text-slate-400 uppercase">
											Indirizzo:
										</span>
										{bolletta.viaCondominio}
									</p>
								)}

								{bolletta.dataProssimaLettura && (
									<p className="font-medium text-[10px] text-slate-500 uppercase tracking-wide">
										Prossima lettura prevista:{' '}
										{new Date(bolletta.dataProssimaLettura).toLocaleDateString(
											'it-IT',
										)}
									</p>
								)}
							</div>
							<div className="flex min-w-50 flex-col gap-1 text-right">
								<div className="flex justify-between gap-4 border-slate-100 border-b py-0.5">
									<span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
										Bolletta N°
									</span>
									<span className="font-bold font-mono text-slate-900 text-xs">
										{bolletta.numeroBolletta || '—'}
									</span>
								</div>
								<div className="flex justify-between gap-4 border-slate-100 border-b py-0.5">
									<span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
										Data Documento
									</span>
									<span className="font-bold text-slate-900 text-xs">
										{bolletta.dataDocumento
											? new Date(bolletta.dataDocumento).toLocaleDateString(
													'it-IT',
												)
											: '—'}
									</span>
								</div>
								<div className="flex justify-between gap-4 border-slate-100 border-b py-0.5">
									<span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
										Periodo
									</span>
									<span className="font-bold text-slate-900 text-xs">
										{new Date(bolletta.dataInizio).toLocaleDateString('it-IT')}{' '}
										— {new Date(bolletta.dataFine).toLocaleDateString('it-IT')}
									</span>
								</div>
								<div className="flex justify-between gap-4 py-0.5">
									<span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
										Scadenza
									</span>
									<span className="font-black text-red-600 text-sm">
										{bolletta.dataScadenza
											? new Date(bolletta.dataScadenza).toLocaleDateString(
													'it-IT',
												)
											: '—'}
									</span>
								</div>
							</div>
						</div>
						<table
							className="mb-8 w-full border-collapse text-xs"
							style={{ minWidth: '1100px' }}
						>
							<thead>
								<tr>
									<THead>Condomino</THead>
									<THead>Lett. Prec. (mc)</THead>
									<THead>Lett. Att. (mc)</THead>
									<THead>Consumo Reale (mc)</THead>
									<THead>Consumo Totale (mc)</THead>
									<THead>Quota Fissa (€)</THead>
									<THead>Tar. Agev. (€)</THead>
									<THead>Ecc. Base (€)</THead>
									<THead>Ecc. 1° F. (€)</THead>
									<THead>Ecc. 2° F. (€)</THead>
									<THead>Ecc. 3° F. (€)</THead>
									<THead>Tot. Parziale (€)</THead>
									<THead>Fogna/Dep/Per (€)</THead>
									<THead>Tot. Parziale (€)</THead>
									<THead>IVA (€)</THead>
									<THead>Rettifica / Acconti / Dep. Cauzionale (€)</THead>
									<THead>Tot. Fattura AQP (€)</THead>
									<THead>Commissioni / Sp. Postali (€)</THead>
									<THead>TOTALE DA PAGARE(€)</THead>
									<THead>Sp. Gestione (€)</THead>
								</tr>
							</thead>
							<tbody>
								{risultato.righe.map((r) => (
									<RigaTabella key={r.condomino.id} riga={r} />
								))}
							</tbody>
							<tfoot>
								<tr className="bg-slate-50">
									<td className="border border-slate-300 px-2 py-2 font-bold text-slate-900 text-xs">
										TOTALE
									</td>
									<TCell bold>—</TCell>
									<TCell bold>—</TCell>
									<TCell bold>{t.consumoReale}</TCell>
									<TCell bold highlight>
										{t.consumoTotale}
									</TCell>
									<TCell bold>{fmtEur(t.quotaFissa)}</TCell>
									<TCell bold>{fmtEur(t.tariffaAgevolata)}</TCell>
									<TCell bold>{fmtEur(t.eccedenzaBase)}</TCell>
									<TCell bold>{fmtEur(t.eccedenzaFascia1)}</TCell>
									<TCell bold>{fmtEur(t.eccedenzaFascia2)}</TCell>
									<TCell bold>{fmtEur(t.eccedenzaFascia3)}</TCell>
									<TCell bold>{fmtEur(totaliServizioAquedotto)}</TCell>
									<TCell bold>
										<Tooltip content={totaliServiziString} placement="top">
											{fmtEur(totaliServizi)}
										</Tooltip>
									</TCell>
									<TCell bold>{fmtEur(t.totaleParziale)}</TCell>
									<TCell bold>{fmtEur(t.iva)}</TCell>
									<TCell bold>
										{t.rettificaAcconti !== 0
											? fmtEur(t.rettificaAcconti)
											: '—'}
									</TCell>
									<TCell bold highlight>
										{fmtEur(t.totaleFatturaAQP)}
									</TCell>
									<TCell bold>{fmtEur(t.spesePostali)}</TCell>
									<TCell highlight>{fmtEur(t.totaleDaPagare)}</TCell>
									<TCell bold>
										{t.speseGestione > 0 ? fmtEur(t.speseGestione) : '—'}
									</TCell>
								</tr>
							</tfoot>
						</table>

						<div className="mt-4 grid grid-cols-1 gap-3 border-slate-200 border-t pt-8 text-slate-600 text-xs sm:grid-cols-2">
							<div className="space-y-1">
								<p>
									<strong>Consumo dichiarato in bolletta:</strong>{' '}
									{risultato.consumoBolletta} mc
								</p>
								<p>
									<strong>Consumo reale condomini:</strong>{' '}
									{risultato.consumoRealeTotale} mc
								</p>
								<p>
									<strong>Discrepanza:</strong>{' '}
									{risultato.discrepanzaMC > 0 ? '+' : ''}
									{risultato.discrepanzaMC} mc (
									{fmt(risultato.discrepanzaPercent, 2)}%)
								</p>
							</div>
							<div className="space-y-1">
								<p>
									<strong>Quota fissa totale:</strong>{' '}
									{fmtEur(bolletta.quotaFissa)}
								</p>
								<p>
									<strong>IVA totale:</strong> {fmtEur(bolletta.iva)}
								</p>
								<p>
									<strong>Spese postali totali:</strong>{' '}
									{fmtEur(bolletta.spesePostali)}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Modal
				open={!!pdfUrl}
				onClose={() => {
					if (pdfUrl) URL.revokeObjectURL(pdfUrl)
					setPdfUrl(null)
				}}
				title="Anteprima PDF"
				size="full"
				footer={
					<>
						<Button
							variant="secondary"
							onClick={() => {
								if (pdfUrl) URL.revokeObjectURL(pdfUrl)
								setPdfUrl(null)
							}}
						>
							Chiudi
						</Button>
						<Button onClick={handleDownloadPDF}>
							<Download className="h-4 w-4" />
							Scarica PDF
						</Button>
					</>
				}
			>
				{pdfUrl && (
					<iframe
						src={pdfUrl}
						title="Anteprima PDF"
						className="w-full"
						style={{ height: '75vh' }}
					/>
				)}
			</Modal>
		</div>
	)
}

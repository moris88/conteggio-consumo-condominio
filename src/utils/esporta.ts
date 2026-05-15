import jsPDF from 'jspdf'
import { domToCanvas } from 'modern-screenshot'

import type {
	BollettaAcqua,
	BollettaLuce,
	RigaRisultato,
	RisultatoCalcolo,
} from '@/types'
import { fmt, fmtEur } from './calcoli'

export async function exportToPDF(
	tableRef: React.RefObject<HTMLDivElement | null>,
	dataScadenza: string,
): Promise<void> {
	if (!tableRef.current) return

	const container = tableRef.current
	container.classList.add('pdf-export-mode')

	try {
		const canvas = await domToCanvas(container, {
			scale: 2,
			// Ensure we capture the full width of the content even if scrollable
			width: container.scrollWidth,
			height: container.scrollHeight,
		})

		const pdf = new jsPDF('landscape', 'mm', 'a4')
		const margin = 10
		const pageWidth = pdf.internal.pageSize.getWidth()
		const pageHeight = pdf.internal.pageSize.getHeight()

		const maxWidth = pageWidth - margin * 2
		const maxHeight = pageHeight - margin * 2

		const canvasWidth = canvas.width / 2 // Adjust for scale: 2
		const canvasHeight = canvas.height / 2

		const scale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight)

		const finalWidth = canvasWidth * scale
		const finalHeight = canvasHeight * scale

		const imgData = canvas.toDataURL('image/png')
		pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight)
		pdf.save(`ripartizione-acqua-${dataScadenza}.pdf`)
	} finally {
		container.classList.remove('pdf-export-mode')
	}
}

export async function generatePDFBlobUrl(
	tableRef: React.RefObject<HTMLDivElement | null>,
): Promise<string | null> {
	if (!tableRef.current) return null

	const container = tableRef.current
	container.classList.add('pdf-export-mode')

	try {
		const canvas = await domToCanvas(container, {
			scale: 2,
			width: container.scrollWidth,
			height: container.scrollHeight,
		})

		const pdf = new jsPDF('landscape', 'mm', 'a4')
		const margin = 10
		const pageWidth = pdf.internal.pageSize.getWidth()
		const pageHeight = pdf.internal.pageSize.getHeight()

		const maxWidth = pageWidth - margin * 2
		const maxHeight = pageHeight - margin * 2

		const canvasWidth = canvas.width / 2
		const canvasHeight = canvas.height / 2

		const scale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight)

		const finalWidth = canvasWidth * scale
		const finalHeight = canvasHeight * scale

		const imgData = canvas.toDataURL('image/png')
		pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight)
		const blob = pdf.output('blob')
		return URL.createObjectURL(blob)
	} finally {
		container.classList.remove('pdf-export-mode')
	}
}

function rigaAcquaToCSV(r: RigaRisultato): string {
	const quotaServizi =
		(r.quotaFogna || 0) + (r.quotaDepurazione || 0) + (r.quotaPerequazione || 0)
	const cols = [
		`"${r.condomino.cognome} ${r.condomino.nome}"`,
		`"${r.condomino.appartamento}"`,
		r.consumoReale,
		r.consumoTotale,
		fmt(r.quotaFissa || 0),
		fmt(r.tariffaAgevolata || 0),
		fmt(r.eccedenzaBase || 0),
		fmt(r.eccedenzaFascia1 || 0),
		fmt(r.eccedenzaFascia2 || 0),
		fmt(r.eccedenzaFascia3 || 0),
		fmt(quotaServizi),
		// r.totaleParziale non è più presente come campo diretto in RigaRisultato per flessibilità, lo ricalcoliamo o lo ignoriamo se non serve
		fmt(
			(r.quotaFissa || 0) +
				(r.tariffaAgevolata || 0) +
				(r.eccedenzaBase || 0) +
				(r.eccedenzaFascia1 || 0) +
				(r.eccedenzaFascia2 || 0) +
				(r.eccedenzaFascia3 || 0) +
				quotaServizi,
		),
		fmt(r.iva || 0),
		fmt(r.rettificaAcconti || 0),
		fmt(r.totaleFatturaAQP || 0),
		fmt(r.spesePostali),
		fmt(r.speseGestione),
		fmt(r.totaleDaPagare),
	]
	return cols.join(';')
}

function rigaLuceToCSV(r: RigaRisultato): string {
	const cols = [
		`"${r.condomino.cognome} ${r.condomino.nome}"`,
		`"${r.condomino.appartamento}"`,
		fmt(r.quotaBase || 0),
		fmt(r.spesePostali),
		fmt(r.speseGestione),
		fmt(r.rettificaAcconti ?? 0),
		fmt(r.totaleDaPagare),
	]
	return cols.join(';')
}

export function exportToCSV(
	risultato: RisultatoCalcolo,
	bolletta: BollettaAcqua | BollettaLuce,
	isAcqua = true,
): void {
	let headers: string
	let rows: string
	let filename: string

	if (isAcqua) {
		const b = bolletta as BollettaAcqua
		headers = [
			'Cognome Nome',
			'Appartamento',
			'Consumo Reale (mc)',
			'Consumo Totale (mc)',
			'Quota Fissa (€)',
			'Tariffa Agevolata (€)',
			'Eccedenza Base (€)',
			'Eccedenza 1° Fascia (€)',
			'Eccedenza 2° Fascia (€)',
			'Eccedenza 3° Fascia (€)',
			'Quota Servizi (Fogna/Dep/Per) (€)',
			'Totale Parziale (€)',
			'IVA (€)',
			'Rettifica Acconti (€)',
			'Totale Fattura AQP (€)',
			'Spese Postali (€)',
			'Spese Gestione (€)',
			'Totale Da Pagare (€)',
		].join(';')

		const t = risultato.totali
		const totaliServizi =
			(t.quotaFogna || 0) +
			(t.quotaDepurazione || 0) +
			(t.quotaPerequazione || 0)
		const totalsRow = [
			'"TOTALE"',
			'""',
			t.consumoReale,
			t.consumoTotale,
			fmt(t.quotaFissa || 0),
			fmt(t.tariffaAgevolata || 0),
			fmt(t.eccedenzaBase || 0),
			fmt(t.eccedenzaFascia1 || 0),
			fmt(t.eccedenzaFascia2 || 0),
			fmt(t.eccedenzaFascia3 || 0),
			fmt(totaliServizi),
			fmt(
				(t.quotaFissa || 0) +
					(t.tariffaAgevolata || 0) +
					(t.eccedenzaBase || 0) +
					(t.eccedenzaFascia1 || 0) +
					(t.eccedenzaFascia2 || 0) +
					(t.eccedenzaFascia3 || 0) +
					totaliServizi,
			),
			fmt(t.iva || 0),
			fmt(t.rettificaAcconti || 0),
			fmt(t.totaleFatturaAQP || 0),
			fmt(t.spesePostali),
			fmt(t.speseGestione),
			fmt(t.totaleDaPagare),
		].join(';')

		const discNote = `"Discrepanza: ${fmt(risultato.discrepanzaPercent, 1)}% (${risultato.discrepanzaMC > 0 ? '+' : ''}${risultato.discrepanzaMC} mc)"`

		rows = [
			headers,
			...risultato.righe.map(rigaAcquaToCSV),
			totalsRow,
			'',
			discNote,
		].join('\n')
		filename = `ripartizione-acqua-${b.dataScadenza || 'export'}.csv`
	} else {
		const b = bolletta as BollettaLuce
		headers = [
			'Cognome Nome',
			'Appartamento',
			'Quota Base (€)',
			'Spese Postali / Commissioni (€)',
			'Spese Gestione / Cancelleria (€)',
			'Rettifica / Acconti (€)',
			'Totale Da Pagare (€)',
		].join(';')

		const t = risultato.totali
		const totalsRow = [
			'"TOTALE"',
			'""',
			fmt(t.quotaBase || 0),
			fmt(t.spesePostali),
			fmt(t.speseGestione),
			fmt(t.rettificaAcconti ?? 0),
			fmt(t.totaleDaPagare),
		].join(';')

		rows = [headers, ...risultato.righe.map(rigaLuceToCSV), totalsRow].join(
			'\n',
		)
		filename = `ripartizione-luce-${b.dataScadenza || 'export'}.csv`
	}

	const bom = '﻿'
	const blob = new Blob([bom + rows], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

export function formatCurrencyForDisplay(value: number): string {
	return new Intl.NumberFormat('it-IT', {
		style: 'currency',
		currency: 'EUR',
	}).format(value)
}

export { fmtEur }

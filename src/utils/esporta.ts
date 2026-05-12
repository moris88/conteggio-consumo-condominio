import jsPDF from 'jspdf'
import { domToCanvas } from 'modern-screenshot'

import type { BollettaAcqua, RigaRisultato, RisultatoCalcolo } from '@/types'
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

function rigaToCSV(r: RigaRisultato): string {
	const quotaServizi = r.quotaFogna + r.quotaDepurazione + r.quotaPerequazione
	const cols = [
		`"${r.condomino.cognome} ${r.condomino.nome}"`,
		`"${r.condomino.appartamento}"`,
		r.consumoReale,
		r.consumoTotale,
		fmt(r.quotaFissa),
		fmt(r.tariffaAgevolata),
		fmt(r.eccedenzaBase),
		fmt(r.eccedenzaFascia1),
		fmt(r.eccedenzaFascia2),
		fmt(r.eccedenzaFascia3),
		fmt(quotaServizi),
		fmt(r.totaleParziale),
		fmt(r.iva),
		fmt(r.rettificaAcconti),
		fmt(r.totaleFatturaAQP),
		fmt(r.spesePostali),
		fmt(r.speseGestione),
		fmt(r.totaleDaPagare),
	]
	return cols.join(';')
}

export function exportToCSV(
	risultato: RisultatoCalcolo,
	bolletta: BollettaAcqua,
): void {
	const headers = [
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
	const totaliServizi = t.quotaFogna + t.quotaDepurazione + t.quotaPerequazione
	const totalsRow = [
		'"TOTALE"',
		'""',
		t.consumoReale,
		t.consumoTotale,
		fmt(t.quotaFissa),
		fmt(t.tariffaAgevolata),
		fmt(t.eccedenzaBase),
		fmt(t.eccedenzaFascia1),
		fmt(t.eccedenzaFascia2),
		fmt(t.eccedenzaFascia3),
		fmt(totaliServizi),
		fmt(t.totaleParziale),
		fmt(t.iva),
		fmt(t.rettificaAcconti),
		fmt(t.totaleFatturaAQP),
		fmt(t.spesePostali),
		fmt(t.speseGestione),
		fmt(t.totaleDaPagare),
	].join(';')

	const discNote = `"Discrepanza: ${fmt(risultato.discrepanzaPercent, 1)}% (${risultato.discrepanzaMC > 0 ? '+' : ''}${risultato.discrepanzaMC} mc)"`

	const rows = [
		headers,
		...risultato.righe.map(rigaToCSV),
		totalsRow,
		'',
		discNote,
	].join('\n')
	const bom = '﻿'
	const blob = new Blob([bom + rows], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `ripartizione-acqua-${bolletta.dataScadenza || 'export'}.csv`
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

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'

describe('UI Components', () => {
	describe('Alert', () => {
		it('renderizza correttamente con titolo e figli', () => {
			render(<Alert title="Test Title">Test Message</Alert>)
			expect(screen.getByText('Test Title')).toBeDefined()
			expect(screen.getByText('Test Message')).toBeDefined()
		})

		it('applica la variante error', () => {
			const { container } = render(<Alert variant="error">Error</Alert>)
			expect(container.firstChild).toHaveClass('bg-red-50')
		})

		it('applica la variante warning', () => {
			const { container } = render(<Alert variant="warning">Warning</Alert>)
			expect(container.firstChild).toHaveClass('bg-amber-50')
		})

		it('applica la variante success', () => {
			const { container } = render(<Alert variant="success">OK</Alert>)
			expect(container.firstChild).toHaveClass('bg-green-50')
		})

		it('applica la variante info (default)', () => {
			const { container } = render(<Alert>Info</Alert>)
			expect(container.firstChild).toHaveClass('bg-blue-50')
		})

		it('accetta className personalizzata', () => {
			const { container } = render(<Alert className="custom-class">msg</Alert>)
			expect(container.firstChild).toHaveClass('custom-class')
		})
	})

	describe('Badge', () => {
		it('renderizza il testo', () => {
			render(<Badge>Active</Badge>)
			expect(screen.getByText('Active')).toBeDefined()
		})

		it('applica la variante blue', () => {
			const { container } = render(<Badge variant="blue">Blue</Badge>)
			expect(container.firstChild).toHaveClass('bg-blue-100')
		})

		it('applica la variante green', () => {
			const { container } = render(<Badge variant="green">Green</Badge>)
			expect(container.firstChild).toHaveClass('bg-green-100')
		})

		it('applica la variante red', () => {
			const { container } = render(<Badge variant="red">Red</Badge>)
			expect(container.firstChild).toHaveClass('bg-red-100')
		})

		it('applica la variante purple', () => {
			const { container } = render(<Badge variant="purple">Purple</Badge>)
			expect(container.firstChild).toHaveClass('bg-purple-100')
		})

		it('applica la variante amber', () => {
			const { container } = render(<Badge variant="amber">Amber</Badge>)
			expect(container.firstChild).toHaveClass('bg-amber-100')
		})
	})

	describe('Card', () => {
		it('renderizza la struttura completa della card', () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
						<CardDescription>Description</CardDescription>
					</CardHeader>
					<CardContent>Content</CardContent>
					<CardFooter>Footer</CardFooter>
				</Card>,
			)
			expect(screen.getByText('Title')).toBeDefined()
			expect(screen.getByText('Description')).toBeDefined()
			expect(screen.getByText('Content')).toBeDefined()
			expect(screen.getByText('Footer')).toBeDefined()
		})

		it('CardDescription applica la classe corretta', () => {
			const { container } = render(
				<CardDescription>Descrizione test</CardDescription>,
			)
			expect(container.firstChild).toHaveClass('text-slate-500')
		})

		it('CardHeader accetta actions', () => {
			render(
				<CardHeader actions={<button type="button">Azione</button>}>
					<CardTitle>Titolo</CardTitle>
				</CardHeader>,
			)
			expect(screen.getByText('Azione')).toBeDefined()
		})

		it('accetta className personalizzata', () => {
			const { container } = render(<Card className="my-custom">x</Card>)
			expect(container.firstChild).toHaveClass('my-custom')
		})
	})

	describe('Separator', () => {
		it('renderizza il separatore senza label', () => {
			const { container } = render(<Separator />)
			expect(container.firstChild).toHaveClass('bg-slate-200')
		})

		it('renderizza il separatore con label', () => {
			render(<Separator label="Sezione" />)
			expect(screen.getByText('Sezione')).toBeDefined()
		})

		it('accetta className personalizzata', () => {
			const { container } = render(<Separator className="my-sep" />)
			expect(container.firstChild).toHaveClass('my-sep')
		})
	})
})

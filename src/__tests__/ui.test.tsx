import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import {
	Card,
	CardContent,
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

		it('applica la variante corretta', () => {
			const { container } = render(<Alert variant="error">Error</Alert>)
			expect(container.firstChild).toHaveClass('bg-red-50')
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
	})

	describe('Card', () => {
		it('renderizza la struttura della card', () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
					</CardHeader>
					<CardContent>Content</CardContent>
					<CardFooter>Footer</CardFooter>
				</Card>,
			)
			expect(screen.getByText('Title')).toBeDefined()
			expect(screen.getByText('Content')).toBeDefined()
			expect(screen.getByText('Footer')).toBeDefined()
		})
	})

	describe('Separator', () => {
		it('renderizza il separatore', () => {
			const { container } = render(<Separator />)
			expect(container.firstChild).toHaveClass('bg-slate-200')
		})
	})
})

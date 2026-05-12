import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/Button'

describe('Button component', () => {
	it('renderizza il testo del pulsante', () => {
		render(<Button>Clicca</Button>)
		expect(screen.getByText('Clicca')).toBeInTheDocument()
	})

	it('chiama onClick quando cliccato', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()
		render(<Button onClick={onClick}>Test</Button>)
		await user.click(screen.getByText('Test'))
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('è disabilitato quando disabled=true', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()
		render(
			<Button disabled onClick={onClick}>
				Disabilitato
			</Button>,
		)
		const btn = screen.getByText('Disabilitato')
		expect(btn).toBeDisabled()
		await user.click(btn)
		expect(onClick).not.toHaveBeenCalled()
	})

	it('applica la variante primary di default', () => {
		render(<Button>Primary</Button>)
		const btn = screen.getByText('Primary')
		expect(btn.className).toContain('bg-blue-600')
	})

	it('applica la variante secondary', () => {
		render(<Button variant="secondary">Secondary</Button>)
		const btn = screen.getByText('Secondary')
		expect(btn.className).toContain('bg-slate-100')
	})

	it('applica la variante danger', () => {
		render(<Button variant="danger">Danger</Button>)
		const btn = screen.getByText('Danger')
		expect(btn.className).toContain('bg-red-600')
	})

	it('applica la dimensione sm', () => {
		render(<Button size="sm">Small</Button>)
		const btn = screen.getByText('Small')
		expect(btn.className).toContain('h-8')
	})

	it('applica className custom', () => {
		render(<Button className="extra-class">Custom</Button>)
		const btn = screen.getByText('Custom')
		expect(btn.className).toContain('extra-class')
	})

	it('passa attributi HTML al button', () => {
		render(
			<Button type="submit" data-testid="btn-test">
				Submit
			</Button>,
		)
		const btn = screen.getByTestId('btn-test')
		expect(btn).toHaveAttribute('type', 'submit')
	})
})

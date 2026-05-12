import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { NumberInput } from '@/components/ui/NumberInput'
import { Select } from '@/components/ui/Select'
import { Stepper } from '@/components/ui/Stepper'

describe('Form UI Components', () => {
	describe('Input', () => {
		it('renderizza con label ed errore', () => {
			render(<Input label="Name" error="Required" />)
			expect(screen.getByText('Name')).toBeDefined()
			expect(screen.getByText('Required')).toBeDefined()
		})

		it("gestisce l'evento onChange", () => {
			const onChange = vi.fn()
			render(<Input onChange={onChange} />)
			fireEvent.change(screen.getByRole('textbox'), {
				target: { value: 'test' },
			})
			expect(onChange).toHaveBeenCalled()
		})
	})

	describe('NumberInput', () => {
		it('renderizza con suffisso e helper', () => {
			render(
				<NumberInput
					label="Price"
					suffix="€"
					helper="Enter amount"
					value={10}
					onChange={() => {}}
				/>,
			)
			expect(screen.getByText('Price')).toBeDefined()
			expect(screen.getByText('€')).toBeDefined()
			expect(screen.getByText('Enter amount')).toBeDefined()
		})

		it('gestisce il cambio valore numerico', () => {
			const onChange = vi.fn()
			render(<NumberInput value={10} onChange={onChange} />)
			fireEvent.change(screen.getByRole('spinbutton'), {
				target: { value: '20' },
			})
			expect(onChange).toHaveBeenCalledWith(20)
		})
	})

	describe('Select', () => {
		const options = [
			{ value: '1', label: 'One' },
			{ value: '2', label: 'Two' },
		]
		it('renderizza le opzioni', () => {
			render(
				<Select
					label="Choice"
					options={options}
					value="1"
					onChange={() => {}}
				/>,
			)
			expect(screen.getByText('Choice')).toBeDefined()
			expect(screen.getByText('One')).toBeDefined()
		})
	})

	describe('Modal', () => {
		it('non renderizza nulla se chiuso', () => {
			const { container } = render(
				<Modal open={false} title="Test" onClose={() => {}}>
					Content
				</Modal>,
			)
			expect(container.firstChild).toBeNull()
		})

		it('renderizza contenuto se aperto', () => {
			render(
				<Modal open={true} title="Test Modal" onClose={() => {}}>
					Modal Content
				</Modal>,
			)
			expect(screen.getByText('Test Modal')).toBeDefined()
			expect(screen.getByText('Modal Content')).toBeDefined()
		})
	})

	describe('Stepper', () => {
		it('evidenzia lo step attivo', () => {
			render(
				<Stepper
					activeStep="bolletta"
					completedSteps={['condomini']}
					onStepChange={() => {}}
				/>,
			)
			// "2" è il cerchio per Bolletta
			const step2 = screen.getByText('2')
			expect(step2).toHaveClass('bg-blue-600')
		})
	})
})

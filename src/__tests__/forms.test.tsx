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

		it('renderizza con prefix e suffix', () => {
			render(<Input prefix="€" suffix="kg" />)
			expect(screen.getByText('€')).toBeDefined()
			expect(screen.getByText('kg')).toBeDefined()
		})

		it("mostra il messaggio helper quando non c'è errore", () => {
			render(<Input helper="Testo di aiuto" />)
			expect(screen.getByText('Testo di aiuto')).toBeDefined()
		})

		it("non mostra helper quando c'è errore", () => {
			render(<Input helper="Aiuto" error="Errore" />)
			expect(screen.queryByText('Aiuto')).toBeNull()
			expect(screen.getByText('Errore')).toBeDefined()
		})

		it('applica border-red-500 in caso di errore', () => {
			render(<Input error="Campo obbligatorio" />)
			const input = screen.getByRole('textbox')
			expect(input.className).toContain('border-red-500')
		})

		it("genera id dall'label se non specificato", () => {
			render(<Input label="Email Address" />)
			const input = screen.getByRole('textbox')
			expect(input.id).toBe('email-address')
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

		it('chiama onChange con 0 se il valore è NaN', () => {
			const onChange = vi.fn()
			render(<NumberInput value={5} onChange={onChange} />)
			fireEvent.change(screen.getByRole('spinbutton'), {
				target: { value: '' },
			})
			expect(onChange).toHaveBeenCalledWith(0)
		})

		it('renderizza con prefix', () => {
			render(<NumberInput value={5} onChange={() => {}} prefix="CHF" />)
			expect(screen.getByText('CHF')).toBeDefined()
		})

		it('mostra errore e lo stile corretto', () => {
			render(
				<NumberInput value={0} onChange={() => {}} error="Valore negativo" />,
			)
			expect(screen.getByText('Valore negativo')).toBeDefined()
			const input = screen.getByRole('spinbutton')
			expect(input.className).toContain('border-red-500')
		})

		it("non mostra helper quando c'è errore", () => {
			render(
				<NumberInput
					value={0}
					onChange={() => {}}
					helper="Aiuto"
					error="Errore"
				/>,
			)
			expect(screen.queryByText('Aiuto')).toBeNull()
		})

		it('è disabilitato quando disabled=true', () => {
			render(<NumberInput value={0} onChange={() => {}} disabled />)
			expect(screen.getByRole('spinbutton')).toBeDisabled()
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

		it('chiama onChange al cambio di valore', () => {
			const onChange = vi.fn()
			render(<Select options={options} value="1" onChange={onChange} />)
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: '2' },
			})
			expect(onChange).toHaveBeenCalled()
		})

		it('renderizza placeholder se fornito', () => {
			render(
				<Select
					options={options}
					value=""
					onChange={() => {}}
					placeholder="Seleziona..."
				/>,
			)
			expect(screen.getByText('Seleziona...')).toBeDefined()
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

		it('chiama onClose al click sul pulsante Chiudi', () => {
			const onClose = vi.fn()
			render(
				<Modal open={true} title="Modal" onClose={onClose}>
					Body
				</Modal>,
			)
			fireEvent.click(screen.getByRole('button', { name: 'Chiudi' }))
			expect(onClose).toHaveBeenCalled()
		})

		it('renderizza il footer se fornito', () => {
			render(
				<Modal
					open={true}
					title="Modal"
					onClose={() => {}}
					footer={<button type="button">Conferma</button>}
				>
					Body
				</Modal>,
			)
			expect(screen.getByText('Conferma')).toBeDefined()
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
			const step2 = screen.getByText('2')
			expect(step2).toHaveClass('bg-blue-600')
		})

		it('mostra checkmark per gli step completati', () => {
			render(
				<Stepper
					activeStep="bolletta"
					completedSteps={['condomini']}
					onStepChange={() => {}}
				/>,
			)
			// Step 1 completato: mostra CheckCircle (non il numero)
			expect(screen.queryByText('1')).toBeNull()
		})

		it('chiama onStepChange al click su step clickabile', () => {
			const onStepChange = vi.fn()
			render(
				<Stepper
					activeStep="risultati"
					completedSteps={['condomini', 'bolletta', 'consumi']}
					onStepChange={onStepChange}
				/>,
			)
			// Click su step "condomini" (completato, quindi clickabile)
			fireEvent.click(screen.getByText('Condomini'))
			expect(onStepChange).toHaveBeenCalledWith('condomini')
		})

		it('non chiama onStepChange su step non clickabile', () => {
			const onStepChange = vi.fn()
			render(
				<Stepper
					activeStep="condomini"
					completedSteps={[]}
					onStepChange={onStepChange}
				/>,
			)
			// Step "risultati" non è completato né attivo: non dovrebbe reagire al click
			fireEvent.click(screen.getByText('Risultati'))
			expect(onStepChange).not.toHaveBeenCalled()
		})
	})
})

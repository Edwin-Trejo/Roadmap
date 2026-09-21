import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmButton } from './ConfirmButton'

describe('ConfirmButton', () => {
  it('shows the label initially and does not call onConfirm yet', () => {
    const onConfirm = vi.fn()
    render(<ConfirmButton label="Delete node" onConfirm={onConfirm} />)
    expect(screen.getByText('Delete node')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('asks for confirmation after the first click, without calling onConfirm', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmButton label="Delete node" onConfirm={onConfirm} />)

    await user.click(screen.getByText('Delete node'))

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmButton label="Delete node" onConfirm={onConfirm} />)

    await user.click(screen.getByText('Delete node'))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancels back to the initial label without calling onConfirm', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmButton label="Delete node" onConfirm={onConfirm} />)

    await user.click(screen.getByText('Delete node'))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByText('Delete node')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

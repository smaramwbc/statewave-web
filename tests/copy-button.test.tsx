import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { CopyButton } from '../src/components/CopyButton'

describe('CopyButton', () => {
  let writeTextMock: ReturnType<typeof vi.fn>
  const originalClipboard = navigator.clipboard

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      })
    }
  })

  it('renders with the provided accessible label and role', () => {
    render(<CopyButton text="sample text" label="Copy sample text" />)

    const button = screen.getByRole('button', { name: 'Copy sample text' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-label', 'Copy sample text')
    expect(button).toHaveAttribute('title', 'Copy sample text')
  })

  it('renders default inline variant with screen-reader text', () => {
    const { container } = render(<CopyButton text="hello" label="Copy hello" />)

    const button = screen.getByRole('button', { name: 'Copy hello' })
    expect(button).toBeInTheDocument()

    // Screen-reader-only live region should contain the label initially
    const srSpan = container.querySelector('span.sr-only')
    expect(srSpan).toBeInTheDocument()
    expect(srSpan).toHaveAttribute('aria-live', 'polite')
    expect(srSpan).toHaveTextContent('Copy hello')

    // Inline styling classes should be applied
    expect(button).toHaveClass('inline-flex', 'w-6', 'h-6')
  })

  it('renders card-corner variant with visible text', () => {
    const { container } = render(
      <CopyButton text="card payload" label="Copy card data" variant="card-corner" />,
    )

    const button = screen.getByRole('button', { name: 'Copy card data' })
    expect(button).toBeInTheDocument()

    // Visible text "Copy" should be rendered
    const copyLabel = screen.getByText('Copy')
    expect(copyLabel).toBeInTheDocument()
    expect(copyLabel).toHaveAttribute('aria-live', 'polite')

    // Should not have sr-only class on the label span in card-corner mode
    expect(container.querySelector('span.sr-only')).toBeNull()

    // Card-corner styling classes should be applied
    expect(button).toHaveClass('gap-1.5', 'px-2.5', 'py-1', 'bg-surface-0/60')
  })

  it('applies custom className alongside base styles', () => {
    render(
      <CopyButton
        text="custom class"
        label="Copy with class"
        className="my-custom-class extra-padding"
      />,
    )

    const button = screen.getByRole('button', { name: 'Copy with class' })
    expect(button).toHaveClass('my-custom-class', 'extra-padding')
    // Base inline styles should still be preserved
    expect(button).toHaveClass('w-6', 'h-6')
  })

  it('copies text to clipboard when clicked', async () => {
    render(<CopyButton text="https://statewave.ai" label="Copy URL" />)

    const button = screen.getByRole('button', { name: 'Copy URL' })

    await act(async () => {
      fireEvent.click(button)
    })

    expect(writeTextMock).toHaveBeenCalledTimes(1)
    expect(writeTextMock).toHaveBeenCalledWith('https://statewave.ai')
  })

  describe('Copied feedback and timeout reset', () => {
    it('shows copied feedback and resets after 1500ms for inline variant', async () => {
      vi.useFakeTimers()

      render(<CopyButton text="snippet text" label="Copy snippet" variant="inline" />)

      const button = screen.getByRole('button', { name: 'Copy snippet' })
      expect(button).toHaveAttribute('title', 'Copy snippet')
      expect(screen.getByText('Copy snippet')).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(button)
      })

      // Immediate feedback: title changes to "Copied" and sr-only announcement becomes "Copied"
      expect(button).toHaveAttribute('title', 'Copied')
      expect(screen.getByText('Copied')).toBeInTheDocument()
      expect(screen.getByText('Copied')).toHaveClass('sr-only')

      // Advance timer partially (1000ms): should still be in copied state
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(button).toHaveAttribute('title', 'Copied')
      expect(screen.getByText('Copied')).toBeInTheDocument()

      // Advance the remaining 500ms to reach 1500ms timeout
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Reverts back to initial state
      expect(button).toHaveAttribute('title', 'Copy snippet')
      expect(screen.getByText('Copy snippet')).toBeInTheDocument()
      expect(screen.queryByText('Copied')).toBeNull()
    })

    it('shows copied feedback and resets after 1500ms for card-corner variant', async () => {
      vi.useFakeTimers()

      render(<CopyButton text="boilerplate block" label="Copy block" variant="card-corner" />)

      const button = screen.getByRole('button', { name: 'Copy block' })
      expect(button).toHaveAttribute('title', 'Copy block')
      expect(screen.getByText('Copy')).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(button)
      })

      // Visible label changes from "Copy" to "Copied"
      expect(button).toHaveAttribute('title', 'Copied')
      expect(screen.getByText('Copied')).toBeInTheDocument()
      expect(screen.queryByText('Copy')).toBeNull()

      // Advance timer by 1500ms
      act(() => {
        vi.advanceTimersByTime(1500)
      })

      // Reverts back to "Copy"
      expect(button).toHaveAttribute('title', 'Copy block')
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.queryByText('Copied')).toBeNull()
    })
  })

  describe('Clipboard rejection fallback', () => {
    it('does not throw and still shows copied feedback when clipboard write rejects', async () => {
      writeTextMock.mockRejectedValue(new Error('Clipboard write access denied'))

      render(<CopyButton text="insecure context" label="Copy item" />)

      const button = screen.getByRole('button', { name: 'Copy item' })

      // Should not throw an unhandled error
      await act(async () => {
        fireEvent.click(button)
      })

      expect(writeTextMock).toHaveBeenCalledTimes(1)
      expect(writeTextMock).toHaveBeenCalledWith('insecure context')

      // Component still shows "Copied" feedback per documented silent-fallback contract
      expect(button).toHaveAttribute('title', 'Copied')
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })

  describe('Both variants can copy successfully', () => {
    it('copies successfully using card-corner variant', async () => {
      render(
        <CopyButton
          text="contact@statewave.ai"
          label="Copy contact"
          variant="card-corner"
        />,
      )

      const button = screen.getByRole('button', { name: 'Copy contact' })

      await act(async () => {
        fireEvent.click(button)
      })

      expect(writeTextMock).toHaveBeenCalledTimes(1)
      expect(writeTextMock).toHaveBeenCalledWith('contact@statewave.ai')
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })

    it('copies successfully using inline variant', async () => {
      render(
        <CopyButton
          text="git clone repo"
          label="Copy clone command"
          variant="inline"
        />,
      )

      const button = screen.getByRole('button', { name: 'Copy clone command' })

      await act(async () => {
        fireEvent.click(button)
      })

      expect(writeTextMock).toHaveBeenCalledTimes(1)
      expect(writeTextMock).toHaveBeenCalledWith('git clone repo')
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })
})

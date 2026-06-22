// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { validateCard } from './api/cardValidator';

vi.mock('./api/cardValidator');

// Finds the card-number input by its aria-label, case-insensitively.
const input = () => screen.getByLabelText(/card number/i);

describe('<App />', () => {
  beforeEach(() => vi.resetAllMocks());

  it('prompts before anything has been typed', () => {
    render(<App />);
    expect(screen.getByText(/enter a card number/i)).toBeInTheDocument();
    expect(validateCard).not.toHaveBeenCalled();
  });

  it('shows a valid result with the detected card type', async () => {
    vi.mocked(validateCard).mockResolvedValue({ valid: true, cardType: 'Visa' });
    render(<App />);
    await userEvent.type(input(), '4532015112830366');
    // Matches the rendered "✓ Valid · Visa".
    expect(await screen.findByText(/valid · visa/i)).toBeInTheDocument();
  });

  it('shows the reason a number was rejected', async () => {
    vi.mocked(validateCard).mockResolvedValue({
      valid: false,
      error: 'Card number failed the Luhn checksum.',
    });
    render(<App />);
    await userEvent.type(input(), '4532015112830367');
    // Matches the rendered Luhn failure message.
    expect(await screen.findByText(/failed the luhn checksum/i)).toBeInTheDocument();
  });

  it('debounces to one request for a number typed in one burst', async () => {
    vi.mocked(validateCard).mockResolvedValue({ valid: true, cardType: 'Visa' });
    render(<App />);
    await userEvent.type(input(), '4532015112830366');
    await screen.findByText(/valid · visa/i);
    // 16 keystrokes, one call: every earlier timer was cleared.
    expect(validateCard).toHaveBeenCalledTimes(1);
  });
});

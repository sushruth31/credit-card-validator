import { useState } from 'react';
import { formatCardNumber, toDigits } from './format';
import { useValidation } from './useValidation';
import type { ValidationResponse } from '@ccv/shared';

function Result({
  digits,
  loading,
  result,
}: {
  digits: string;
  loading: boolean;
  result: ValidationResponse | null;
}) {
  if (!digits) return <p className="status status--idle">Enter a card number to validate.</p>;
  if (loading || !result) return <p className="status status--idle">Checking...</p>;
  if (result.valid) return <p className="status status--valid">✓ Valid · {result.cardType}</p>;
  return <p className="status status--invalid">✗ {result.error}</p>;
}

export default function App() {
  const [value, setValue] = useState('');
  const digits = toDigits(value);
  const { result, loading } = useValidation(digits);

  return (
    <main className="page">
      <form className="card" onSubmit={(e) => e.preventDefault()}>
        <h1 className="title">Credit Card Validator</h1>
        <input
          className="card-input"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          aria-label="Credit card number"
          value={formatCardNumber(value)}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="result" aria-live="polite">
          <Result digits={digits} loading={loading} result={result} />
        </div>
      </form>
    </main>
  );
}

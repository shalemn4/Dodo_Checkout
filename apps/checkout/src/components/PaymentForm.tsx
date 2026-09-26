import React, { useState, useEffect, useRef } from 'react';

export interface PaymentFormValues {
  email: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface PaymentFormErrors {
  email?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

interface PaymentFormProps {
  initialValues?: PaymentFormValues;
  onSubmit: (values: PaymentFormValues) => void;
  isProcessing?: boolean;
  retryNotice?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialValues,
  onSubmit,
  isProcessing = false,
  retryNotice = false,
}) => {
  const [values, setValues] = useState<PaymentFormValues>(
    initialValues || {
      email: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    }
  );

  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  // Sync form values on retry.
  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setValues((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    }
    setValues((prev) => ({ ...prev, expiry: formatted }));
    if (errors.expiry) {
      setErrors((prev) => ({ ...prev, expiry: undefined }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setValues((prev) => ({ ...prev, cvv: raw }));
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, email: e.target.value }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const validateField = (field: keyof PaymentFormValues, val: string): string | undefined => {
    switch (field) {
      case 'email': {
        const trimmed = val.trim();
        if (!trimmed) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address';
        return undefined;
      }
      case 'cardNumber': {
        const rawDigits = val.replace(/\s/g, '');
        if (!rawDigits) return 'Card number is required';
        if (rawDigits.length < 16) return 'Card number must be 16 digits';
        return undefined;
      }
      case 'expiry': {
        const cleanExpiry = val.replace(/\s/g, '');
        if (!cleanExpiry) return 'Expiry date is required';
        if (cleanExpiry.length < 4) return 'Enter a valid MM / YY date';

        const monthStr = cleanExpiry.slice(0, 2);
        const monthNum = parseInt(monthStr, 10);
        if (monthNum < 1 || monthNum > 12) return 'Enter a valid month (01-12)';

        return undefined;
      }
      case 'cvv':
        if (!val) return 'CVV is required';
        if (val.length < 3) return 'Enter a valid 3 or 4 digit CVV';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof PaymentFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) {
      return;
    }

    const emailErr = validateField('email', values.email);
    const cardErr = validateField('cardNumber', values.cardNumber);
    const expiryErr = validateField('expiry', values.expiry);
    const cvvErr = validateField('cvv', values.cvv);

    const newErrors: PaymentFormErrors = {
      email: emailErr,
      cardNumber: cardErr,
      expiry: expiryErr,
      cvv: cvvErr,
    };

    setErrors(newErrors);
    setTouched({ email: true, cardNumber: true, expiry: true, cvv: true });

    // Focus the first invalid field for accessibility.
    if (emailErr) {
      emailRef.current?.focus();
      return;
    }
    if (cardErr) {
      cardRef.current?.focus();
      return;
    }
    if (expiryErr) {
      expiryRef.current?.focus();
      return;
    }
    if (cvvErr) {
      cvvRef.current?.focus();
      return;
    }

    onSubmit(values);
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit} noValidate>
      <div className="payment-header-block">
        <h2 className="payment-column-title">Payment</h2>
      </div>

      {retryNotice && (
        <div className="retry-alert-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Payment could not be completed. Please verify your card details and try again.</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="customer-email" className="field-label">
          Email address
        </label>
        <div className="input-wrapper">
          <input
            ref={emailRef}
            id="customer-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            value={values.email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            aria-invalid={Boolean(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
          />
        </div>
        {touched.email && errors.email && (
          <p id="email-error" className="field-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <fieldset className="card-fieldset">
        <legend className="field-label card-legend">Card information</legend>

        <div className="form-group">
          <div className="input-wrapper card-input-wrapper">
            <input
              ref={cardRef}
              id="card-number"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              required
              className={`form-input ${touched.cardNumber && errors.cardNumber ? 'input-error' : ''}`}
              placeholder="1234 5678 9012 3456"
              value={values.cardNumber}
              onChange={handleCardNumberChange}
              onBlur={() => handleBlur('cardNumber')}
              aria-invalid={Boolean(touched.cardNumber && errors.cardNumber)}
              aria-describedby={touched.cardNumber && errors.cardNumber ? 'card-number-error' : undefined}
            />
            <div className="card-brand-icon" aria-hidden="true">
              <svg width="22" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1" width="22" height="14" rx="2" />
                <line x1="1" y1="5" x2="23" y2="5" />
              </svg>
            </div>
          </div>
          {touched.cardNumber && errors.cardNumber && (
            <p id="card-number-error" className="field-error" role="alert">
              {errors.cardNumber}
            </p>
          )}
        </div>

        <div className="split-fields-row">
          <div className="form-group flex-1">
            <label htmlFor="card-expiry" className="field-sublabel">
              Expiry
            </label>
            <input
              ref={expiryRef}
              id="card-expiry"
              name="expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              required
              className={`form-input ${touched.expiry && errors.expiry ? 'input-error' : ''}`}
              placeholder="MM / YY"
              value={values.expiry}
              onChange={handleExpiryChange}
              onBlur={() => handleBlur('expiry')}
              aria-invalid={Boolean(touched.expiry && errors.expiry)}
              aria-describedby={touched.expiry && errors.expiry ? 'expiry-error' : undefined}
            />
            {touched.expiry && errors.expiry && (
              <p id="expiry-error" className="field-error" role="alert">
                {errors.expiry}
              </p>
            )}
          </div>

          <div className="form-group flex-1">
            <label htmlFor="card-cvv" className="field-sublabel">
              CVV
            </label>
            <div className="input-wrapper">
              <input
                ref={cvvRef}
                id="card-cvv"
                name="cvv"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                required
                className={`form-input ${touched.cvv && errors.cvv ? 'input-error' : ''}`}
                placeholder="123"
                value={values.cvv}
                onChange={handleCvvChange}
                onBlur={() => handleBlur('cvv')}
                aria-invalid={Boolean(touched.cvv && errors.cvv)}
                aria-describedby={touched.cvv && errors.cvv ? 'cvv-error' : undefined}
              />
            </div>
            {touched.cvv && errors.cvv && (
              <p id="cvv-error" className="field-error" role="alert">
                {errors.cvv}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <div className="payment-summary-box">
        <div className="summary-row">
          <span className="summary-label">Subtotal</span>
          <span className="summary-amount">₹799</span>
        </div>
        <div className="summary-row total-row">
          <span className="total-label">Total</span>
          <span className="total-amount">₹799</span>
        </div>
      </div>

      <button
        type="submit"
        id="pay-button"
        className="pay-button"
        disabled={isProcessing}
        aria-busy={isProcessing}
      >
        {isProcessing ? (
          <span className="btn-spinner-content">
            <span className="btn-spinner" aria-hidden="true" />
            <span>Processing...</span>
          </span>
        ) : (
          <span>Pay ₹799</span>
        )}
      </button>

      <div className="trust-footnote">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Secure checkout • Your payment details are handled securely.</span>
      </div>
    </form>
  );
};

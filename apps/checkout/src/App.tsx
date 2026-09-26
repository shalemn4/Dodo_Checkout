import React, { useState, useEffect, useRef } from 'react';
import { CheckoutHeader } from './components/CheckoutHeader';
import { ProductSummary } from './components/ProductSummary';
import { PaymentForm, PaymentFormValues } from './components/PaymentForm';
import { ProcessingView, SuccessView, DeclinedView } from './components/StateViews';
import {
  simulatePayment,
  normalizeCardNumber,
} from './services/paymentSimulation';
import type { CheckoutToHostMessage } from '@dodo/types';

export type CheckoutStatus = 'idle' | 'processing' | 'success' | 'declined';

export const App: React.FC = () => {
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [formValues, setFormValues] = useState<PaymentFormValues | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryNotice, setRetryNotice] = useState<boolean>(false);

  // Track attempts per card for retry scenarios.
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});

  const isProcessingRef = useRef<boolean>(false);

  const getTargetOrigin = (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    const paramOrigin = params.get('parentOrigin');
    if (paramOrigin) {
      try {
        return new URL(paramOrigin).origin;
      } catch {
        // Ignore invalid parentOrigin.
      }
    }
    if (document.referrer) {
      try {
        return new URL(document.referrer).origin;
      } catch {
        // Ignore invalid referrer.
      }
    }
    return null;
  };

  const postToHost = (message: CheckoutToHostMessage) => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      const targetOrigin = getTargetOrigin();
      if (targetOrigin) {
        window.parent.postMessage(message, targetOrigin);
      }
    }
  };

  useEffect(() => {
    postToHost({ type: 'DODO_CHECKOUT_READY' });
  }, []);

  const handleFormSubmit = async (values: PaymentFormValues) => {
    if (isProcessingRef.current || status === 'processing') {
      return;
    }

    isProcessingRef.current = true;
    setFormValues(values);
    setStatus('processing');

    const cleanCard = normalizeCardNumber(values.cardNumber);
    const priorAttempts = attemptCounts[cleanCard] || 0;

    try {
      const result = await simulatePayment(cleanCard, priorAttempts);

      if (result.success) {
        setSessionId(result.sessionId);
        setRetryNotice(false);
        setStatus('success');

        postToHost({
          type: 'DODO_CHECKOUT_SUCCESS',
          sessionId: result.sessionId,
        });
      } else {
        setErrorMessage(result.errorMessage);
        setAttemptCounts((prev) => ({
          ...prev,
          [cleanCard]: priorAttempts + 1,
        }));
        setRetryNotice(Boolean(result.isRetryable));
        setStatus('declined');

        // Keep retryable failures inside checkout; only notify merchant on final decline.
        if (!result.isRetryable) {
          postToHost({
            type: 'DODO_CHECKOUT_ERROR',
            code: 'PAYMENT_DECLINED',
            message: 'Payment was declined.',
          });
        }
      }
    } catch {
      const fallbackErr = 'An unexpected error occurred while processing payment. Please try again.';
      setErrorMessage(fallbackErr);
      setStatus('declined');
      postToHost({
        type: 'DODO_CHECKOUT_ERROR',
        code: 'PAYMENT_ERROR',
        message: fallbackErr,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleClose = () => {
    const reason = status === 'success' ? 'completed' : 'user_closed';
    postToHost({ type: 'DODO_CHECKOUT_CLOSE', reason });
  };

  const handleResetToForm = () => {
    setStatus('idle');
  };

  const handleDone = () => {
    setStatus('idle');
    setFormValues(undefined);
    setSessionId('');
    setRetryNotice(false);
    postToHost({ type: 'DODO_CHECKOUT_CLOSE', reason: 'completed' });
  };

  return (
    <div className="checkout-viewport">
      <main className="checkout-card" role="main">
        <CheckoutHeader onClose={handleClose} />

        {status === 'idle' && (
          <div className="checkout-body-grid">
            <ProductSummary />
            <PaymentForm
              initialValues={formValues}
              onSubmit={handleFormSubmit}
              isProcessing={false}
              retryNotice={retryNotice}
            />
          </div>
        )}

        {status === 'processing' && (
          <ProcessingView message="Processing payment of ₹799..." />
        )}

        {status === 'success' && (
          <SuccessView
            sessionId={sessionId || 'sess_demo_default'}
            onDone={handleDone}
          />
        )}

        {status === 'declined' && (
          <DeclinedView
            errorMessage={
              errorMessage ||
              'Your payment could not be completed. Please check your card details and try again.'
            }
            onRetry={handleResetToForm}
          />
        )}
      </main>
    </div>
  );
};

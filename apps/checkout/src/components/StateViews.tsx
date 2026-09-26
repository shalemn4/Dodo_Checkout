import React from 'react';

interface ProcessingViewProps {
  message?: string;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  message = 'Processing payment...',
}) => {
  return (
    <div className="state-view-container" role="status" aria-live="polite">
      <div className="spinner-wrapper" aria-hidden="true">
        <div className="calm-spinner" />
      </div>
      <h2 className="state-title">{message}</h2>
      <p className="state-description">Please do not refresh or close this window.</p>
    </div>
  );
};

interface SuccessViewProps {
  sessionId?: string;
  onDone?: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  sessionId = 'sess_demo_83920194',
  onDone,
}) => {
  return (
    <div className="state-view-container" role="status" aria-live="polite">
      <div className="state-icon-badge success" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="state-title">Payment successful</h2>
      <p className="state-description">
        Your payment for <strong>Starter Kit Pro</strong> was completed.
      </p>

      <div className="session-id-box">
        <span className="session-label">Session ID</span>
        <code className="session-value">{sessionId}</code>
      </div>

      <button type="button" className="pay-button done-button" onClick={onDone}>
        Done
      </button>
    </div>
  );
};

interface DeclinedViewProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export const DeclinedView: React.FC<DeclinedViewProps> = ({
  errorMessage = 'Your payment could not be completed. Please check your card details and try again.',
  onRetry,
}) => {
  return (
    <div className="state-view-container" role="alert" aria-live="assertive">
      <div className="state-icon-badge declined" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <h2 className="state-title">Payment declined</h2>
      <p className="state-description">{errorMessage}</p>

      <button type="button" className="pay-button try-again-button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
};

import React from 'react';

interface CheckoutHeaderProps {
  onClose?: () => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onClose }) => {
  return (
    <header className="checkout-header">
      <div className="checkout-brand">
        <div className="brand-badge-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <span className="brand-name">Product Checkout</span>
      </div>

      <button
        type="button"
        id="checkout-close-btn"
        className="close-button"
        onClick={onClose}
        aria-label="Close checkout"
        title="Close checkout"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </header>
  );
};

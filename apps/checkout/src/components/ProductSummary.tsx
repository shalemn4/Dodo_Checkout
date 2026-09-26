import React from 'react';

export const ProductSummary: React.FC = () => {
  return (
    <section className="product-column" aria-labelledby="summary-product-title">
      <div className="product-header-block">
        <span className="product-badge">Product</span>
        <h2 id="summary-product-title" className="product-title">
          Starter Kit Pro
        </h2>
        <div className="product-price-box">
          <span className="price-currency" aria-hidden="true">₹</span>
          <span className="price-amount">799</span>
          <span className="sr-only">Price: 799 Indian Rupees</span>
        </div>
        <p className="product-description">
          Everything you need to get your developer workspace up and running.
        </p>
      </div>

      <div className="product-section-block">
        <h3 className="section-label">WHAT'S INCLUDED</h3>
        <ul className="included-list" aria-label="Included features">
          <li className="included-item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Developer workspace access</span>
          </li>
          <li className="included-item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Web, desktop &amp; mobile access</span>
          </li>
          <li className="included-item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Starter templates</span>
          </li>
          <li className="included-item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>TypeScript integration</span>
          </li>
          <li className="included-item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Lifetime product updates</span>
          </li>
        </ul>
      </div>

      <div className="product-section-block">
        <h3 className="section-label">ACCESS</h3>
        <div className="access-grid" aria-label="Supported platforms">
          <div className="access-item">
            <span className="access-name">Web</span>
            <svg className="access-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="access-item">
            <span className="access-name">Desktop</span>
            <svg className="access-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="access-item">
            <span className="access-name">Mobile</span>
            <svg className="access-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { DodoCheckout } from '@dodo/sdk';

interface LogItem {
  id: string;
  time: string;
  type: 'info' | 'success' | 'close' | 'error';
  text: string;
}

export const App: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);

  const addLog = (type: LogItem['type'], text: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, time, type, text }]);
  };

  const handleBuy = () => {
    addLog('info', 'Invoked DodoCheckout.open({ productId: "starter-kit-pro" })');

    DodoCheckout.open({
      productId: 'starter-kit-pro',
      checkoutUrl: import.meta.env.VITE_CHECKOUT_URL,
      onSuccess: ({ sessionId }) => {
        addLog('success', `onSuccess: Payment successful (Session: ${sessionId})`);
      },
      onClose: ({ reason }) => {
        addLog('close', `onClose: Checkout dismissed (Reason: ${reason || 'unspecified'})`);
      },
      onError: ({ code, message }) => {
        addLog('error', `onError: [${code}] ${message}`);
      },
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="demo-page-root">
      <div className="content-container">
        <nav className="site-nav" aria-label="Main Navigation">
          <a href="#store" className="brand-wrapper">
            <img src="/assets/acme-logo.jpg" alt="Acme" className="brand-logo-img" />
            <span className="brand-title">Acme</span>
          </a>

          <div className="nav-links">
            <a href="#products" className="nav-link">Products</a>
            <a href="#docs" className="nav-link">Documentation</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>

          <div className="nav-actions">
            <a href="#signin" className="nav-text-btn">Sign in</a>
            <a href="#get-started" className="nav-cta-pill">Get Started</a>
          </div>
        </nav>

        <main className="hero-grid" id="store">
          <div className="hero-content">
            <div className="eyebrow-badge">
              BUILT FOR MODERN BUILDERS
            </div>

            <h1 className="hero-heading">
              Power your ideas
              <span className="hero-heading-highlight">with global payments</span>
            </h1>

            <p className="hero-description">
              Integrate once and start accepting payments worldwide. Simple, reliable, and built for SaaS businesses.
            </p>

            <div className="feature-indicators">
              <div className="feature-item">
                <div className="feature-icon-box" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="feature-texts">
                  <span className="feature-label">Fast setup</span>
                  <span className="feature-desc">Be live in minutes</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="feature-texts">
                  <span className="feature-label">Isolated checkout</span>
                  <span className="feature-desc">Card data never touches this site</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div className="feature-texts">
                  <span className="feature-label">Simple developer integration</span>
                  <span className="feature-desc">Standard TypeScript SDK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right-stack">
            <section className="product-card" aria-labelledby="product-title">
              <div className="card-top-row">
                <span className="badge-tag">Most Popular</span>
              </div>

              <div className="card-header-row">
                <h2 id="product-title" className="card-title">Starter Kit Pro</h2>
                <span className="price-tag">₹799</span>
              </div>

              <p className="card-description">
                A complete starter kit for ambitious developers. Test our embeddable checkout integration.
              </p>

              <ul className="benefits-list" aria-label="Product Highlights">
                <li className="benefit-item">
                  <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Checkout-ready integration</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Isolated checkout experience</span>
                </li>
                <li className="benefit-item">
                  <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Simple developer integration</span>
                </li>
              </ul>

              <button
                id="buy-button"
                className="buy-button"
                onClick={handleBuy}
                aria-label="Buy Starter Kit Pro with Dodo Checkout for ₹799"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Buy with Dodo Checkout</span>
                <span aria-hidden="true">→</span>
              </button>

              <div className="security-footnote">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure checkout • No card data touches this site</span>
              </div>
            </section>

            <section className="log-card" aria-labelledby="log-heading">
              <div className="log-header-row">
                <div className="log-heading-group">
                  <h3 id="log-heading" className="log-title">SDK Event &amp; Callback Log</h3>
                  <div className="live-pill" aria-label="Status: Live">
                    <span className="live-indicator-dot" aria-hidden="true" />
                    <span>Live</span>
                  </div>
                </div>
                {logs.length > 0 && (
                  <button className="log-clear-btn" onClick={clearLogs} aria-label="Clear event log">
                    Clear
                  </button>
                )}
              </div>

              <div className="log-console" id="event-log" role="region" aria-live="polite" aria-label="SDK Events Output">
                {logs.length === 0 ? (
                  <div className="log-empty">No events logged yet. Click Buy to initiate checkout.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="log-entry">
                      <span className="log-time">[{log.time}]</span>
                      <span className={`log-msg ${log.type}`}>{log.text}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

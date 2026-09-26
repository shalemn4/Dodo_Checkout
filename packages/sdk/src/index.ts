import type {
  DodoCheckoutOptions,
  IDodoCheckout,
} from '@dodo/types';

export * from '@dodo/types';

export interface OverlayHandle {
  overlay: HTMLDivElement;
  iframe: HTMLIFrameElement;
  destroy: () => void;
}

const OVERLAY_ID = 'dodo-checkout-overlay';

function createCheckoutOverlay(checkoutUrl: string, productId: string): OverlayHandle {
  const existing = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
  if (existing) {
    const existingIframe = existing.querySelector('iframe') as HTMLIFrameElement;
    return {
      overlay: existing,
      iframe: existingIframe,
      destroy: () => {
        if (existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }
      },
    };
  }

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Dodo Checkout');

  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2147483647',
    backgroundColor: 'rgba(10, 16, 9, 0.78)',
    backdropFilter: 'blur(8px)',
    webkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0',
    transition: 'opacity 0.22s ease-out',
    margin: '0',
    padding: '0',
    border: 'none',
    boxSizing: 'border-box',
  });

  const url = new URL(checkoutUrl, window.location.origin);
  url.searchParams.set('productId', productId);
  url.searchParams.set('parentOrigin', window.location.origin);

  const iframe = document.createElement('iframe');
  iframe.id = 'dodo-checkout-iframe';
  iframe.src = url.toString();
  iframe.title = 'Dodo Checkout Secure Frame';
  iframe.setAttribute('allow', 'payment');
  iframe.setAttribute('frameBorder', '0');

  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    display: 'block',
  });

  overlay.appendChild(iframe);

  // Prevent host page scrolling while checkout is open.
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  const destroy = () => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    document.body.style.overflow = previousOverflow;
  };

  return { overlay, iframe, destroy };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

class DodoCheckoutSDK implements IDodoCheckout {
  private activeOptions: DodoCheckoutOptions | null = null;
  private overlayHandle: OverlayHandle | null = null;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private isOpen: boolean = false;
  private hasSucceeded: boolean = false;
  private hasErrored: boolean = false;
  private hasClosed: boolean = false;

  public open(options: DodoCheckoutOptions): void {
    // Ignore duplicate opens while checkout is active.
    if (
      this.isOpen ||
      this.overlayHandle ||
      (typeof document !== 'undefined' && document.getElementById('dodo-checkout-overlay'))
    ) {
      console.warn('[DodoCheckout SDK] Checkout is already active. Ignoring duplicate open() call.');
      this.overlayHandle?.iframe?.focus();
      return;
    }

    if (!options || !options.productId) {
      const err = { code: 'INVALID_OPTIONS', message: 'productId is required to open checkout.' };
      options?.onError?.(err);
      console.error('[DodoCheckout SDK]', err.message);
      return;
    }

    this.isOpen = true;
    this.hasSucceeded = false;
    this.hasErrored = false;
    this.hasClosed = false;
    this.activeOptions = options;

    const defaultCheckoutUrl =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5174'
        : window.location.origin;

    const checkoutUrl = options.checkoutUrl || defaultCheckoutUrl;
    const expectedOrigin = new URL(checkoutUrl, window.location.origin).origin;

    this.overlayHandle = createCheckoutOverlay(checkoutUrl, options.productId);

    const recognizedTypes = [
      'DODO_CHECKOUT_READY',
      'DODO_CHECKOUT_SUCCESS',
      'DODO_CHECKOUT_ERROR',
      'DODO_CHECKOUT_CLOSE',
    ] as const;
    type RecognizedType = (typeof recognizedTypes)[number];

    this.messageListener = (event: MessageEvent) => {
      // Reject messages from unexpected origins.
      if (event.origin !== expectedOrigin) {
        return;
      }

      // Only accept messages from the active checkout iframe.
      if (!this.overlayHandle?.iframe?.contentWindow || event.source !== this.overlayHandle.iframe.contentWindow) {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== 'object') {
        return;
      }

      const msg = data as Record<string, unknown>;
      const type = msg.type;
      if (typeof type !== 'string' || !recognizedTypes.includes(type as RecognizedType)) {
        return;
      }

      // Ensure no sensitive card data is sent across the bridge.
      const forbiddenKeys = ['cardNumber', 'card', 'cvv', 'cvc', 'expiry', 'exp', 'pan'];
      for (const key of forbiddenKeys) {
        if (key in msg) {
          console.warn('[DodoCheckout SDK] Security violation: Sensitive card property detected in message payload.');
          return;
        }
      }

      switch (type) {
        case 'DODO_CHECKOUT_READY':
          break;

        case 'DODO_CHECKOUT_SUCCESS':
          if (isNonEmptyString(msg.sessionId) && !this.hasSucceeded) {
            this.hasSucceeded = true;
            this.activeOptions?.onSuccess?.({ sessionId: msg.sessionId });
          }
          break;

        case 'DODO_CHECKOUT_ERROR':
          if (isNonEmptyString(msg.code) && isNonEmptyString(msg.message) && !this.hasErrored) {
            this.hasErrored = true;
            this.activeOptions?.onError?.({
              code: msg.code,
              message: msg.message,
            });
          }
          break;

        case 'DODO_CHECKOUT_CLOSE':
          const reason = typeof msg.reason === 'string' ? msg.reason : 'user_closed';
          if (reason === 'completed' || this.hasSucceeded) {
            // Success cleanup does not trigger user abandonment onClose.
            this.close('completed', false);
          } else {
            this.close('user_closed', true);
          }
          break;
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  public close(reason: string = 'internal_cleanup', notifyClose: boolean = false): void {
    if (!this.isOpen && !this.overlayHandle) {
      return;
    }

    // Remove listener when closing.
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    if (this.overlayHandle) {
      this.overlayHandle.destroy();
      this.overlayHandle = null;
    }

    const currentOptions = this.activeOptions;
    const wasSuccessful = this.hasSucceeded;

    this.isOpen = false;
    this.activeOptions = null;
    this.hasSucceeded = false;
    this.hasErrored = false;

    // Only emit onClose on user dismissal before payment completion.
    if (notifyClose && !wasSuccessful && reason === 'user_closed') {
      if (!this.hasClosed) {
        this.hasClosed = true;
        currentOptions?.onClose?.({ reason: 'user_closed' });
      }
    }
  }
}

export const DodoCheckout = new DodoCheckoutSDK();
export default DodoCheckout;

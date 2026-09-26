export interface DodoCheckoutSuccessEvent {
  sessionId: string;
}

export interface DodoCheckoutCloseEvent {
  reason?: string;
}

export interface DodoCheckoutErrorEvent {
  code: string;
  message: string;
}

export interface DodoCheckoutOptions {
  productId: string;
  checkoutUrl?: string;
  onSuccess?: (event: DodoCheckoutSuccessEvent) => void;
  onClose?: (event: DodoCheckoutCloseEvent) => void;
  onError?: (event: DodoCheckoutErrorEvent) => void;
}

export interface IDodoCheckout {
  open(options: DodoCheckoutOptions): void;
  close(reason?: string): void;
}

export type CheckoutToHostMessage =
  | { type: 'DODO_CHECKOUT_READY' }
  | { type: 'DODO_CHECKOUT_SUCCESS'; sessionId: string }
  | { type: 'DODO_CHECKOUT_ERROR'; code: string; message: string }
  | { type: 'DODO_CHECKOUT_CLOSE'; reason?: string };

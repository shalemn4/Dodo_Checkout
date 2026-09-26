export type PaymentSimulationResult =
  | { success: true; sessionId: string }
  | { success: false; errorMessage: string; isRetryable?: boolean };

export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  RETRY_SUCCESS: '4000000000000341',
} as const;

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `sess_${timestamp}_${randomPart}`;
}

export function normalizeCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\D/g, '');
}

export async function simulatePayment(
  cardNumber: string,
  attemptCount: number = 0
): Promise<PaymentSimulationResult> {
  const cleanCard = normalizeCardNumber(cardNumber);

  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (cleanCard === TEST_CARDS.SUCCESS) {
    return {
      success: true,
      sessionId: generateSessionId(),
    };
  }

  if (cleanCard === TEST_CARDS.DECLINE) {
    return {
      success: false,
      errorMessage: 'Your card was declined. Please verify your details or use a different card.',
      isRetryable: false,
    };
  }

  if (cleanCard === TEST_CARDS.RETRY_SUCCESS) {
    if (attemptCount === 0) {
      return {
        success: false,
        errorMessage: 'Payment could not be completed. Something went wrong while processing your payment. Please try again.',
        isRetryable: true,
      };
    } else {
      // Subsequent attempts succeed for retry card.
      return {
        success: true,
        sessionId: generateSessionId(),
      };
    }
  }

  return {
    success: false,
    errorMessage: 'Card declined. Please use a supported test card (e.g. 4242 4242 4242 4242).',
    isRetryable: false,
  };
}

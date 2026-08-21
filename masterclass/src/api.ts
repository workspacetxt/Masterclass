// Base URL of your Django backend, e.g. https://api.technovizautomation.com/api
// Set VITE_API_BASE_URL in a .env file at the project root.
// const API_BASE_URL = "http://192.168.1.60:8257/api";
const API_BASE_URL = "https://websiteBackend.pythonanywhere.com/api";

export type SafeResult<T> = [T | null, string | null];

/**
 * Generic fetch wrapper: returns [data, error] instead of throwing.
 */
async function safe<T>(
  path: string,
  options: RequestInit = {}
): Promise<SafeResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        (data && (data.message || data.detail || JSON.stringify(data.errors))) ||
        `Request failed with status ${res.status}`;
      return [null, message];
    }

    return [data as T, null];
  } catch (err) {
    return [null, err instanceof Error ? err.message : "Network error"];
  }
}

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  key: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export function createOrder() {
  return safe<CreateOrderResponse>("/create-order/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  registration_data: RegistrationData;
}) {
  return safe<VerifyPaymentResponse>("/verify-payment/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

# Masterclass Registration Page

Small Vite + React + TypeScript project: a single page (`Masterclass.tsx`) with
a Name / Email / Phone form. "Secure My Seat" creates a Razorpay order via your
Django backend, opens the Razorpay checkout, verifies the payment on success,
shows a success popup, and resets the form.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and point VITE_API_BASE_URL at your Django API, e.g.
# VITE_API_BASE_URL=https://api.technovizautomation.com/api
npm run dev
```

## Files

- `src/Masterclass.tsx` — the page: form, validation, Razorpay flow, success popup
- `src/api.ts` — `safe()` fetch wrapper + `createOrder` / `verifyPayment` calls
- `src/razorpay.d.ts` — types for the `window.Razorpay` global
- `src/Masterclass.css` — styling

The Razorpay `checkout.js` script is loaded dynamically on submit (no need to
add it to `index.html` yourself).

## One backend fix needed

Your `CreateOrderView` currently hardcodes `amount = 9900` (₹99). Your flyer
says ₹4,999 + GST. GST at 18% on ₹4,999 is ₹899.82, total ₹5,898.82 →
589882 paise. Update it to whatever the actual GST-inclusive figure is:

```python
class CreateOrderView(APIView):
    def post(self, request):
        amount = 589882  # ₹5,898.82 in paise — adjust to your real fee incl. GST

        order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "order_id": order["id"],
            "amount": amount,
            "key": settings.RAZORPAY_KEY_ID
        })
```

Also worth adding CORS config on the Django side (`django-cors-headers`) if
the React app and API live on different origins/subdomains, and locking
`create-order` amount server-side only (never trust an amount from the
frontend) — which your current code already does correctly.

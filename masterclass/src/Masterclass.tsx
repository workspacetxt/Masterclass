import { useState, FormEvent } from "react";
import { createOrder, verifyPayment, RegistrationData } from "./api";
import "./Masterclass.css";
import kapimage from "../public/kaps.png";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const initialForm: RegistrationData = { name: "", email: "", phone: "" };

const learnItems = [
  {
    label: "Industry 4.0 to 5.0",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 21h18" />
        <path d="M5 21V9l4-3v15" />
        <path d="M13 21V5l6-2v18" />
      </svg>
    ),
  },
  {
    label: "IIoT, AI & ML",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
        <circle cx="9" cy="14" r="1" /><circle cx="13" cy="17" r="1" /><circle cx="15" cy="12" r="1" />
      </svg>
    ),
  },
  {
    label: "Digital Twin & Analytics",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16.5V7.5L12 3 3 7.5v9L12 21z" />
        <path d="M3.27 7.5 12 12l8.73-4.5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    label: "Computer Vision & Quality",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: "Robotics, Cobots & AMRs",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M12 9V4" /><circle cx="12" cy="3" r="1" />
        <path d="M9 12H4" /><path d="M15 12h5" />
        <path d="M12 15v5" />
      </svg>
    ),
  },
  {
    label: "Real Use Cases & Insights",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18" />
        <path d="M18 8l-5 5-3-3-5 5" />
      </svg>
    ),
  },
];

export default function Masterclass() {
  const [imgError, setImgError] = useState(false);
  const [form, setForm] = useState<RegistrationData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!/^\d{10}$/.test(form.phone.trim())) return "Please enter a valid 10-digit phone number.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Could not load payment gateway. Please check your connection and try again.");
      setLoading(false);
      return;
    }

    const [order, orderError] = await createOrder();
    if (orderError || !order) {
      setError(orderError || "Could not create order. Please try again.");
      setLoading(false);
      return;
    }

    const razorpay = new (window as any).Razorpay({
      key: order.key,
      amount: order.amount,
      currency: "INR",
      name: "Smart Manufacturing & AI Masterclass 2026",
      description: "Live Masterclass Registration",
      order_id: order.order_id,
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#0b1d3a" },
      handler: async (response: any) => {
        const [result, verifyError] = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          registration_data: form,
        });

        setLoading(false);

        if (verifyError || !result?.success) {
          setError(
            verifyError || result?.message || "Payment verification failed. Please contact support."
          );
          return;
        }

        setShowSuccess(true);
        setForm(initialForm);
      },
      modal: {
        ondismiss: () => {
          window.location.reload();
        },
      },
    });

    razorpay.on("payment.failed", () => {
      setLoading(false);
      setError("Payment failed. Please try again.");
    });

    razorpay.open();
  }

  return (
    <div className="mc-page">
      <div className="mc-card">
        {/* LEFT PANEL */}
        <div className="mc-left">
          <div className="mc-left-top">
            <div className="mc-live-badge">
              <span className="mc-pulse" />
              LIVE Masterclass 2026
            </div>
          </div>

          <div className="mc-speaker-visual">
            <div className="mc-photo-ring">
              <div className="mc-photo-inner">
                {!imgError && (
                  <img
                    src={kapimage}
                    alt="Kapil Khurana"
                    className="mc-speaker-img"
                    onError={() => setImgError(true)}
                  />
                )}
                {imgError && (
                  <div className="mc-photo-fallback">
                    <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#203f78" strokeWidth="1.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="mc-ring-outer" />
            <div className="mc-ring-outer2" />
          </div>

          <div className="mc-speaker-info">
            <h2 className="mc-speaker-name">KAPIL KHURANA</h2>
            <p className="mc-speaker-meta">
              Certified SIRI Assessor (CSA)<br />
              Author – Digital Revolution: Industry 4.0 & IIoT<br />
              25+ Years of Industry Experience
            </p>
            <div className="mc-speaker-tags">
              <span>Industrial Automation</span>
              <span>Smart Manufacturing</span>
              <span>Digital Transformation</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="mc-right">
          <div className="mc-header">
            <h1 className="mc-title">
              SMART MANUFACTURING<br />
              <span className="mc-title-accent">& AI MASTERCLASS</span>
            </h1>
            <p className="mc-subtitle">
              From Industry 4.0 & 5.0 to AI-Driven Autonomous Factories
            </p>

            <div className="mc-learn-strip">
              <span className="mc-learn-strip-label">You'll Learn:</span>
              <div className="mc-learn-strip-tags">
                {learnItems.map((item) => (
                  <span key={item.label}>
                    <span className="mc-learn-strip-icon">{item.icon}</span>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mc-info-grid">
            <div className="mc-info-box">
              <div className="mc-info-label">Date</div>
              <div className="mc-info-value">19<sup>TH</sup></div>
              <div className="mc-info-sublabel">SEPTEMBER 2026</div>
            </div>
            <div className="mc-info-box">
              <div className="mc-info-label">Time</div>
              <div className="mc-info-value">10:00 AM</div>
              <div className="mc-info-sublabel">IST (4 HOURS LIVE)</div>
            </div>
            <div className="mc-info-box mc-info-box--highlight">
              <div className="mc-info-label">Program Fee</div>
              <div className="mc-info-value mc-info-value--gold">₹4,999</div>
              <div className="mc-info-sublabel">+ GST</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mc-form">
            <div className="mc-form-row">
              <label className="mc-field">
                <span className="mc-field-label">Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </label>
              <label className="mc-field">
                <span className="mc-field-label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  disabled={loading}
                />
              </label>
            </div>
            <label className="mc-field">
              <span className="mc-field-label">Phone Number</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                disabled={loading}
              />
            </label>

            {error && <p className="mc-error">{error}</p>}

            <button type="submit" disabled={loading} className="mc-cta">
              {loading ? "Processing Payment..." : "Secure My Seat — ₹4,999 + GST"}
            </button>
          </form>

          <div className="mc-footer-strip">
            <div className="mc-footer-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              4 Hours LIVE
            </div>
            <div className="mc-footer-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Limited Seats
            </div>
            <div className="mc-footer-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Certificate
            </div>
            <div className="mc-footer-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Online Session
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="mc-float-badge">
        LIMITED<br />SEATS<br />AVAILABLE!
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="mc-overlay">
          <div className="mc-popup">
            <div className="mc-popup-icon">🎉</div>
            <h2>Registration Successful</h2>
            <p>Your seat for the Smart Manufacturing & AI Masterclass 2026 is confirmed.</p>
            <p>A confirmation will be sent to your email shortly.</p>
            <button onClick={() => setShowSuccess(false)} className="mc-cta mc-cta--small">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
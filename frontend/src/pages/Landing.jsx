import { useState } from "react";
import { submitLead } from "../api/client";
import Footer from "../components/Footer";

const BUDGET_OPTIONS = [
  { value: "", label: "Select a budget range" },
  { value: "1000", label: "Under $1,000" },
  { value: "5000", label: "$1,000 - $5,000" },
  { value: "10000", label: "$5,000 - $10,000" },
  { value: "25000", label: "$10,000 - $25,000" },
  { value: "50000", label: "$25,000 - $50,000" },
  { value: "100000", label: "$50,000+" },
];

export default function Landing() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (
      !form.email.trim() ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.budget) {
      newErrors.budget = "Please select a budget range";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitLead({
        name: form.name.trim(),
        email: form.email.trim(),
        budget: Number(form.budget),
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm({ name: "", email: "", budget: "", message: "" });
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        setServerError(serverErrors.join(", "));
      } else {
        setServerError(
          err.response?.data?.message ||
            "Something went wrong. Please try again later."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your message has been received. Our team will review your project
            requirements and get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
          >
            Submit Another Lead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            LeadDesk Mini
          </span>
          <a
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Admin Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full mb-6">
            LeadDesk Mini
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Let's Build Something
            <span className="text-indigo-600"> Amazing</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Share your project details with us and our team will reach out to
            discuss how we can bring your vision to life.
          </p>
        </div>
      </header>

      {/* Form Section */}
      <div className="max-w-xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Get Started
          </h2>
          <p className="text-gray-500 mb-8">
            Fill out the form below and we'll be in touch.
          </p>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                    : "border-gray-200 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                    : "border-gray-200 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Budget Range <span className="text-red-500">*</span>
              </label>
              <select
                id="budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white ${
                  errors.budget
                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                    : "border-gray-200 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  paddingRight: "2.5rem",
                }}
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.budget && (
                <p className="mt-1.5 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your project, goals, and timeline..."
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                  errors.message
                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                    : "border-gray-200 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
              />
              {errors.message && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                "Submit Lead"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

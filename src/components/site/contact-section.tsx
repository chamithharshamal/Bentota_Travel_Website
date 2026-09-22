"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export function ContactUsSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    tourType: "one-day",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Create WhatsApp pre-filled message
    const waText = encodeURIComponent(
      `Hello Bentota Smart Journeys!\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Phone/WhatsApp:* ${formData.phone}\n` +
      `*Email:* ${formData.email || 'N/A'}\n` +
      `*Interested in:* ${formData.tourType === 'one-day' ? 'One-Day Tour' : formData.tourType === 'two-day' ? 'Two-Day Tour' : 'Customized Private Trip'}\n` +
      `*Message:* ${formData.message || 'I would like to inquire about booking a trip.'}`
    );

    setSubmitted(true);

    // Open WhatsApp in new tab
    setTimeout(() => {
      window.open(`https://wa.me/94771234567?text=${waText}`, '_blank');
    }, 400);
  };

  return (
    <section id="contact" className="relative isolate w-full bg-[#051726] text-white py-24 sm:py-32 px-6 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
      {/* Background ambient radial gradients */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(47,103,154,0.25),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(245,166,35,0.12),transparent_60%)] pointer-events-none"
      />

      {/* Decorative Cursive Watermark (Right side) */}
      <div
        aria-hidden="true"
        className="hidden xl:block absolute right-10 top-20 font-script text-white/10 text-4xl lg:text-5xl leading-tight select-none pointer-events-none rotate-6 text-right"
      >
        <p>Always Here For</p>
        <p className="mr-4">Your Journey</p>
      </div>

      <div className="mx-auto w-[80%] relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          {/* Subtitle tag with horizontal accent lines */}
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#f5a623]" />
            <span className="text-[#f5a623] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase">
              Get In Touch
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#f5a623]" />
          </div>

          {/* Section Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white">
            Start Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] via-[#ffc107] to-[#e0951b]">
              Journey With Us
            </span>
          </h2>

          {/* Subtitle description */}
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed font-normal">
            Have questions about customized tours, hotel pickups in Bentota, or booking details? Send us a message or contact us directly on WhatsApp.
          </p>
        </div>

        {/* 2-Column Layout: Contact Details (Left) & Form (Right) */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Direct Contact Info & Value Badges */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Quick Contact Cards */}
            <div className="rounded-3xl border border-white/15 bg-[#092238]/70 backdrop-blur-md p-6 sm:p-8 shadow-xl flex flex-col gap-6">
              <h3 className="text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                <Sparkles className="size-5 text-[#f5a623]" /> Direct Channels
              </h3>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f5a623]/15 border border-[#f5a623]/30 text-[#f5a623] shrink-0">
                  <MessageCircle className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">Phone &amp; WhatsApp</p>
                  <a
                    href="https://wa.me/94771234567"
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-bold text-white hover:text-[#f5a623] transition-colors mt-0.5 block"
                  >
                    +94 77 123 4567
                  </a>
                  <p className="text-xs text-white/70 mt-0.5">Instant WhatsApp chat available 24/7</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shrink-0">
                  <Mail className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">Email Support</p>
                  <a
                    href="mailto:info@bentotasmartjourneys.com"
                    className="text-lg font-bold text-white hover:text-[#f5a623] transition-colors mt-0.5 block"
                  >
                    info@bentotasmartjourneys.com
                  </a>
                  <p className="text-xs text-white/70 mt-0.5">Fast response within 2 hours</p>
                </div>
              </div>

              {/* Hotel Pickup Location */}
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shrink-0">
                  <MapPin className="size-6 text-[#f5a623]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">Pickup Area</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    Bentota, Beruwala, Induruwa &amp; South Coast
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">Free hotel pickup &amp; drop-off included</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shrink-0">
                  <Clock className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">Operating Hours</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    Everyday: 6:00 AM – 10:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Value Guarantees Box */}
            <div className="rounded-3xl border border-[#f5a623]/20 bg-gradient-to-br from-[#092238] to-[#051726] p-6 shadow-xl flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-[#f5a623]">
                <ShieldCheck className="size-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Booking Guarantees</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-white/85">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#f5a623] shrink-0" />
                  <span>No online pre-payment required (Pay upon pickup)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#f5a623] shrink-0" />
                  <span>100% Private air-conditioned luxury vehicles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#f5a623] shrink-0" />
                  <span>Flexible route stop selection based on your preference</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Interactive Glassmorphic Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/15 bg-[#092238]/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative">

              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight mb-2">
                Send An Inquiry
              </h3>
              <p className="text-sm text-white/75 mb-8">
                Fill out the form below to receive a personalized route itinerary and instant quote.
              </p>

              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center gap-4 bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#f5a623] text-[#051726]">
                    <CheckCircle2 className="size-10 stroke-[2.5]" />
                  </div>
                  <h4 className="text-2xl font-extrabold uppercase text-white">Inquiry Sent!</h4>
                  <p className="text-sm text-white/80 max-w-md">
                    Thank you, {formData.name}! We have prepared your WhatsApp message. Click below if WhatsApp did not open automatically.
                  </p>
                  <a
                    href={`https://wa.me/94771234567?text=${encodeURIComponent(`Hi Bentota Smart Journeys! My name is ${formData.name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all"
                  >
                    <MessageCircle className="size-4" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all text-sm"
                    />
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +44 7123 456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Select Trip Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                      Select Tour Type
                    </label>
                    <select
                      value={formData.tourType}
                      onChange={(e) => setFormData({ ...formData, tourType: e.target.value })}
                      className="w-full rounded-xl bg-[#092238] border border-white/20 px-4 py-3.5 text-white focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all text-sm cursor-pointer"
                    >
                      <option value="one-day">One-Day Private Tour</option>
                      <option value="two-day">Two-Day Tour with Overnight Hotel</option>
                      <option value="custom">Customized Sri Lanka Itinerary</option>
                    </select>
                  </div>

                  {/* Message / Special Requests */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                      Message / Special Requests
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us your preferred dates, number of travelers, or specific places you wish to visit..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="mt-2 bg-[#f5a623] hover:bg-[#e0951b] text-[#051726] font-bold text-base px-8 py-4 rounded-full w-full flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Send Message</span>
                    <Send className="size-4 stroke-[2.5]" />
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

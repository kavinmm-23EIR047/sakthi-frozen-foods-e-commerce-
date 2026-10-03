'use client';

import React from 'react';

export default function DeliveryLoadingScreen({ message = 'Preparing secure checkout' }: { message?: string }) {
  return (
    <main className="delivery-loading-screen" role="status" aria-live="polite" aria-label={message}>
      <section className="delivery-loading-card">
        {/* Vector Cold-Chain Delivery Van Scene (100% Pure Transparent Background, No Checkerboards) */}
        <div className="delivery-loading-scene" aria-hidden="true">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto py-2">
            <svg
              viewBox="0 0 320 160"
              className="w-full h-auto overflow-visible select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Body Gradient */}
                <linearGradient id="sakthiVanBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#757C5D" />
                  <stop offset="45%" stopColor="#656B4F" />
                  <stop offset="100%" stopColor="#4E543A" />
                </linearGradient>

                {/* Roof Chiller Gradient */}
                <linearGradient id="chillerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>

                {/* Glass Window Gradient */}
                <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="40%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>

                {/* Glass Shine */}
                <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Headlight Beam */}
                <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.75" />
                  <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                </linearGradient>

                {/* Wheel Rim Gradient */}
                <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#CBD5E1" />
                  <stop offset="70%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#334155" />
                </radialGradient>
              </defs>

              {/* ─── Speed / Wind Lines ─── */}
              <g className="delivery-wind">
                <line x1="8" y1="58" x2="38" y2="58" stroke="#656B4F" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" className="wind-line-1" />
                <line x1="0" y1="78" x2="32" y2="78" stroke="#656B4F" strokeWidth="2" strokeLinecap="round" opacity="0.3" className="wind-line-2" />
                <line x1="14" y1="98" x2="42" y2="98" stroke="#656B4F" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" className="wind-line-3" />
                {/* Frost / Snowflake particles */}
                <circle cx="28" cy="50" r="2" fill="#38BDF8" opacity="0.6" className="frost-dot-1" />
                <circle cx="18" cy="88" r="1.5" fill="#38BDF8" opacity="0.5" className="frost-dot-2" />
                <circle cx="36" cy="108" r="2" fill="#38BDF8" opacity="0.6" className="frost-dot-3" />
              </g>

              {/* ─── Headlight Glowing Beam ─── */}
              <polygon points="258,101 320,84 320,128 258,109" fill="url(#headlightBeam)" className="delivery-headlight-pulse" />

              {/* ─── Ground Road Line ─── */}
              <g>
                <line x1="10" y1="136" x2="310" y2="136" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                <line
                  x1="-20"
                  y1="136"
                  x2="340"
                  y2="136"
                  stroke="#656B4F"
                  strokeWidth="3.5"
                  strokeDasharray="18 16"
                  strokeLinecap="round"
                  className="delivery-road-track"
                  opacity="0.65"
                />
              </g>

              {/* ─── Dynamic Ground Shadow ─── */}
              <ellipse cx="156" cy="138" rx="82" ry="5.5" fill="#1E201D" opacity="0.18" className="delivery-shadow-bounce" />

              {/* ─── Van Body Group (Vertical Suspension Bounce) ─── */}
              <g className="delivery-van-body">
                {/* Rooftop Reefer / Cold-Chain Chiller Unit */}
                <g>
                  <rect x="82" y="38" width="68" height="12" rx="4" fill="url(#chillerGrad)" stroke="#64748B" strokeWidth="1" />
                  <line x1="90" y1="44" x2="108" y2="44" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="114" y1="44" x2="142" y2="44" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="86" cy="44" r="1.5" fill="#0284C7" />
                </g>

                {/* Main Van Shell Outline */}
                <path
                  d="
                    M 52 124
                    L 52 54
                    Q 52 46 60 46
                    L 194 46
                    Q 204 46 210 52
                    L 236 82
                    Q 240 86 248 88
                    L 258 90
                    Q 262 90 262 96
                    L 262 122
                    Q 262 124 258 124
                    L 228 124
                    A 20 20 0 0 0 188 124
                    L 128 124
                    A 20 20 0 0 0 88 124
                    Z
                  "
                  fill="url(#sakthiVanBody)"
                  stroke="#3D4533"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Bottom Rocker Panel / Protective Plastic Guard */}
                <path
                  d="
                    M 52 118
                    L 88 118
                    A 20 20 0 0 1 128 118
                    L 188 118
                    A 20 20 0 0 1 228 118
                    L 262 118
                    L 262 123
                    L 228 123
                    A 20 20 0 0 0 188 123
                    L 128 123
                    A 20 20 0 0 0 88 123
                    L 52 123
                    Z
                  "
                  fill="#2A3022"
                />

                {/* Front Bumper */}
                <rect x="254" y="112" width="10" height="12" rx="3" fill="#1E2419" />

                {/* Rear Bumper */}
                <rect x="48" y="112" width="8" height="12" rx="2" fill="#1E2419" />

                {/* Headlight Housing */}
                <path
                  d="M 252 92 L 261 93 Q 262 93 262 98 L 253 103 Z"
                  fill="#FEF08A"
                  stroke="#CA8A04"
                  strokeWidth="1"
                />

                {/* Tail Light Housing */}
                <rect x="50" y="70" width="4.5" height="18" rx="2" fill="#EF4444" stroke="#991B1B" strokeWidth="0.8" />
                <rect x="50" y="77" width="4.5" height="5" fill="#F59E0B" />

                {/* Driver Cabin Window */}
                <path
                  d="
                    M 200 52
                    L 230 78
                    Q 232 80 238 81
                    L 242 81
                    L 242 84
                    L 194 84
                    L 194 54
                    Q 194 52 200 52
                    Z
                  "
                  fill="url(#windowGrad)"
                  stroke="#1E293B"
                  strokeWidth="1.5"
                />

                {/* Window Gloss Highlight */}
                <path
                  d="
                    M 202 54
                    L 224 74
                    L 214 74
                    L 197 58
                    Z
                  "
                  fill="url(#glassShine)"
                />

                {/* Driver Side Window Pillar Divider */}
                <line x1="206" y1="52" x2="206" y2="84" stroke="#656B4F" strokeWidth="3" />

                {/* Side Rearview Mirror */}
                <path d="M 234 81 L 244 80 Q 246 80 246 84 L 244 87 Q 242 88 234 85 Z" fill="#1E2419" />

                {/* Van Body Seam Lines */}
                {/* Front Cab Door Seam */}
                <path d="M 190 50 L 190 118" stroke="#3D4533" strokeWidth="1.5" opacity="0.75" />
                <path d="M 190 84 L 246 84" stroke="#3D4533" strokeWidth="1.5" opacity="0.75" />
                {/* Sliding Cargo Door Seam */}
                <rect x="94" y="52" width="86" height="66" rx="2" fill="none" stroke="#3D4533" strokeWidth="1.5" opacity="0.65" />
                {/* Door Handles */}
                <rect x="180" y="86" width="7" height="3" rx="1.5" fill="#1E2419" />
                <rect x="194" y="86" width="7" height="3" rx="1.5" fill="#1E2419" />

                {/* Official Brand Badge on Van Side */}
                <g>
                  <rect x="100" y="60" width="74" height="24" rx="6" fill="#FAFAF5" stroke="#4F534C" strokeWidth="1" opacity="0.95" />
                  {/* Snowflake Icon */}
                  <circle cx="109" cy="72" r="5" fill="#0284C7" />
                  <text x="109" y="75" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontWeight="bold">❄</text>
                  {/* Brand Text */}
                  <text x="118" y="68" fontSize="5.5" fill="#1A1E16" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">SAKTHI FROZEN</text>
                  <text x="118" y="77" fontSize="5" fill="#656B4F" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">EXPRESS -18°C</text>
                </g>
                  {/* ─── Animated Rotating Wheels (Inside van body so they naturally bounce together) ─── */}
                  {/* Rear Wheel (center: 108, 124) */}
                  <g className="delivery-wheel-rear">
                    <circle cx="108" cy="124" r="16" fill="#1E2419" stroke="#0F140C" strokeWidth="1.5" />
                    <circle cx="108" cy="124" r="11.5" fill="url(#rimGrad)" />

                    {/* Rotating Rim Spokes & Hub */}
                    <g className="delivery-wheel-spokes-rear">
                      {/* High-contrast alloy spokes */}
                      <line x1="108" y1="113.5" x2="108" y2="134.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="99" y1="118.8" x2="117" y2="129.2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="99" y1="129.2" x2="117" y2="118.8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

                      {/* Accent spoke shadows */}
                      <line x1="109.5" y1="114" x2="109.5" y2="134" stroke="#475569" strokeWidth="0.8" />
                      <line x1="100" y1="120" x2="116" y2="128" stroke="#475569" strokeWidth="0.8" />

                      {/* Center Hub & Chrome Cap */}
                      <circle cx="108" cy="124" r="5" fill="#1E293B" />
                      <circle cx="108" cy="124" r="2.5" fill="#F8FAFC" />

                      {/* Native SVG Fallback for Guaranteed Rotation */}
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 108 124"
                        to="360 108 124"
                        dur="0.45s"
                        repeatCount="indefinite"
                      />
                    </g>
                  </g>

                  {/* Front Wheel (center: 208, 124) */}
                  <g className="delivery-wheel-front">
                    <circle cx="208" cy="124" r="16" fill="#1E2419" stroke="#0F140C" strokeWidth="1.5" />
                    <circle cx="208" cy="124" r="11.5" fill="url(#rimGrad)" />

                    {/* Rotating Rim Spokes & Hub */}
                    <g className="delivery-wheel-spokes-front">
                      {/* High-contrast alloy spokes */}
                      <line x1="208" y1="113.5" x2="208" y2="134.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="199" y1="118.8" x2="217" y2="129.2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="199" y1="129.2" x2="217" y2="118.8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

                      {/* Accent spoke shadows */}
                      <line x1="209.5" y1="114" x2="209.5" y2="134" stroke="#475569" strokeWidth="0.8" />
                      <line x1="200" y1="120" x2="216" y2="128" stroke="#475569" strokeWidth="0.8" />

                      {/* Center Hub & Chrome Cap */}
                      <circle cx="208" cy="124" r="5" fill="#1E293B" />
                      <circle cx="208" cy="124" r="2.5" fill="#F8FAFC" />

                      {/* Native SVG Fallback for Guaranteed Rotation */}
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 208 124"
                        to="360 208 124"
                        dur="0.45s"
                        repeatCount="indefinite"
                      />
                    </g>
                  </g>
                </g>
            </svg>
          </div>
        </div>

        {/* Animated Loading Dots */}
        <div className="delivery-loading-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        {/* Heading & Subtext */}
        <h1>{message}</h1>
        <p>Please keep this page open while we securely complete this step.</p>

        {/* Brand Cold-Chain Trust Note */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-center gap-2 text-[11px] font-bold text-[#656B4F]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cold-Chain Express Delivery (-18°C)</span>
        </div>
      </section>

      {/* Embedded 60fps Micro-Animations */}
      <style jsx global>{`
        @keyframes vanVibration {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2.5px);
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.18;
          }
          50% {
            transform: scale(0.92);
            opacity: 0.12;
          }
        }

        @keyframes spinRearWheel {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes spinFrontWheel {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes roadTrackMove {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -34;
          }
        }

        @keyframes windDrift {
          0% {
            transform: translateX(12px);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(-18px);
            opacity: 0;
          }
        }

        @keyframes headlightFlicker {
          0%, 100% {
            opacity: 0.75;
          }
          50% {
            opacity: 0.9;
          }
        }

        .delivery-van-body {
          animation: vanVibration 0.55s ease-in-out infinite;
        }

        .delivery-shadow-bounce {
          transform-origin: 156px 138px;
          animation: shadowPulse 0.55s ease-in-out infinite;
        }

        .delivery-wheel-spokes-rear {
          transform-box: view-box;
          transform-origin: 108px 124px;
          animation: spinRearWheel 0.45s linear infinite;
        }

        .delivery-wheel-spokes-front {
          transform-box: view-box;
          transform-origin: 208px 124px;
          animation: spinFrontWheel 0.45s linear infinite;
        }

        .delivery-road-track {
          animation: roadTrackMove 0.35s linear infinite;
        }

        .wind-line-1 {
          animation: windDrift 0.6s ease-in-out infinite;
        }
        .wind-line-2 {
          animation: windDrift 0.8s ease-in-out infinite 0.2s;
        }
        .wind-line-3 {
          animation: windDrift 0.7s ease-in-out infinite 0.1s;
        }

        .frost-dot-1 {
          animation: windDrift 0.7s ease-in-out infinite 0.15s;
        }
        .frost-dot-2 {
          animation: windDrift 0.9s ease-in-out infinite 0.35s;
        }
        .frost-dot-3 {
          animation: windDrift 0.65s ease-in-out infinite 0.05s;
        }

        .delivery-headlight-pulse {
          animation: headlightFlicker 1.2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

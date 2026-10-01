import React from 'react';
import { Snowflake } from 'lucide-react';

export default function DeliveryLoadingScreen({ message = 'Getting your order ready' }: { message?: string }) {
  return (
    <main className="delivery-loading-screen" role="status" aria-live="polite" aria-label={message}>
      <section className="delivery-loading-card">
        <div className="delivery-loading-scene" aria-hidden="true">
          <div className="delivery-loading-glow" />
          <svg className="delivery-loading-scooter" viewBox="0 0 220 130" fill="none">
            <path d="M22 108h177" stroke="#CAD4BE" strokeWidth="4" strokeLinecap="round" />
            <path d="M39 117h31m22 0h27m27 0h34" stroke="#AAB69A" strokeWidth="3" strokeLinecap="round" className="delivery-road-lines" />
            <circle cx="72" cy="101" r="17" fill="#37402D" />
            <circle cx="72" cy="101" r="8" fill="#F3FBEE" />
            <circle cx="166" cy="101" r="17" fill="#37402D" />
            <circle cx="166" cy="101" r="8" fill="#F3FBEE" />
            <path d="M75 96 92 69h43l25 27h-35l-15-20-17 27H75Z" fill="#656B4F" />
            <path d="M91 68h37l12 12h-38l-11-12Z" fill="#8E9D64" />
            <path d="M125 68h20l14 28h-13l-21-22V68Z" fill="#50563D" />
            <path d="M91 66c3-13 13-22 27-22h8l8 24H91Z" fill="#D6E2C8" stroke="#656B4F" strokeWidth="4" strokeLinejoin="round" />
            <path d="m141 79 17-2 9 8-4 5h-17" fill="#D99B48" />
            <path d="M102 68h34" stroke="#656B4F" strokeWidth="4" strokeLinecap="round" />
            <path d="m137 67 10-12 11 1" stroke="#37402D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="111" cy="30" r="10" fill="#E6B58A" />
            <path d="m103 41 22 2 9 22-22 8-14-14 5-18Z" fill="#656B4F" />
            <path d="m108 48-15 17 9 9m25-17 12 14" stroke="#37402D" strokeWidth="6" strokeLinecap="round" />
            <path d="m105 72-18 16m35-14 14 17" stroke="#37402D" strokeWidth="7" strokeLinecap="round" />
            <path d="M107 20c3-8 14-9 19-2l-2 5-17 1" fill="#37402D" />
            <path d="m54 70-14 0m15 12H34m20 12H42" stroke="#AAB69A" strokeWidth="3" strokeLinecap="round" className="delivery-speed-lines" />
          </svg>
          <span className="delivery-loading-package flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-blue-400" />
          </span>
        </div>
        <div className="delivery-loading-dots" aria-hidden="true"><i /><i /><i /></div>
        <h1>{message}</h1>
        <p>Please keep this page open while we securely complete this step.</p>
      </section>
    </main>
  );
}

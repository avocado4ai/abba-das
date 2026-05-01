'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-6 py-2 bg-navy text-cream rounded-full font-bold hover:bg-navy/90 transition-all shadow-md"
    >
      <Printer className="w-5 h-5" />
      הדפס / שמור כ-PDF
    </button>
  );
}

'use client';

import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface WhatsAppDisplayProps {
  content: string;
  date?: string;
}

// WhatsApp's exact colors (from official brand/app inspection)
// Background: #E5DDD5 — the iconic warm beige
// Sent bubble: #DCF8C6 — pale green
// Header: #075E54 — deep teal green
// Input bar: #F0F2F5

export default function WhatsAppDisplay({ content, date }: WhatsAppDisplayProps) {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const msgTime = date ? format(new Date(date), 'HH:mm') : '08:00';
  const msgDate = date ? format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: he }) : null;

  return (
    <div className="py-6 -mx-4 sm:mx-0 sm:px-4">
      {/* Phone-frame card */}
      <div
        className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
        style={{ fontFamily: "'Heebo', 'SF Pro Text', 'Roboto', sans-serif" }}
      >
        {/* ── Header ── */}
        <div className="bg-[#075E54] px-3 py-2 flex items-center gap-3">
          {/* Back arrow */}
          <span className="text-white text-lg leading-none select-none">‹</span>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-lg shrink-0 select-none">
            👨‍👩‍👧
          </div>
          {/* Group info */}
          <div className="flex-1 min-w-0 text-white" dir="rtl">
            <p className="font-semibold text-sm leading-tight truncate">המשפחה שלנו</p>
            <p className="text-[11px] text-white/70 leading-tight">רוני, מיקי ועוד 3</p>
          </div>
          {/* Action icons */}
          <div className="flex items-center gap-3.5 text-white/80 text-lg select-none">
            <span>📞</span>
            <span>⋮</span>
          </div>
        </div>

        {/* ── Chat background ── */}
        {/*
          WhatsApp's background is #E5DDD5 with a subtle repeating leaf/tile pattern.
          We approximate the pattern using a tiny SVG data-URI.
        */}
        <div
          className="overflow-y-auto"
          style={{
            backgroundColor: '#E5DDD5',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='%23c8bdb4' fill-opacity='0.25'%3E%3Cellipse cx='10' cy='10' rx='4' ry='2' transform='rotate(30 10 10)'/%3E%3Cellipse cx='40' cy='10' rx='4' ry='2' transform='rotate(-30 40 10)'/%3E%3Cellipse cx='25' cy='35' rx='4' ry='2' transform='rotate(30 25 35)'/%3E%3Ccircle cx='10' cy='50' r='1.5'/%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3Ccircle cx='30' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
            minHeight: '320px',
            maxHeight: '70vh',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* Date chip */}
          {msgDate && (
            <div className="flex justify-center my-3">
              <span
                className="text-[11px] font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(11,20,26,0.6)', color: '#fff' }}
              >
                {msgDate}
              </span>
            </div>
          )}

          {/* Message bubbles */}
          {paragraphs.map((text, idx) => (
            <div key={idx} className="flex justify-end mb-1">
              <div
                className="relative max-w-[85%] rounded-lg rounded-tr-none px-3 pt-2 pb-1.5"
                style={{
                  backgroundColor: '#DCF8C6',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.13)',
                }}
              >
                {/* Bubble tail (top-right) */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: -8,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid #DCF8C6',
                    borderBottom: '8px solid transparent',
                  }}
                />
                {/* Text */}
                <p
                  className="text-[15px] leading-[1.65] whitespace-pre-wrap"
                  style={{ color: '#111B21', direction: 'rtl' }}
                >
                  {text.trim()}
                </p>
                {/* Timestamp + checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span style={{ color: '#8696A0', fontSize: '11px' }}>{msgTime}</span>
                  {/* Blue double-tick (read receipt) */}
                  <svg
                    width="16"
                    height="11"
                    viewBox="0 0 16 11"
                    fill="#53BDEB"
                    aria-hidden="true"
                  >
                    <path d="M15.01.47a.5.5 0 0 0-.7.07L8.6 7.7 6.87 5.85a.5.5 0 1 0-.74.67l2.05 2.27a.5.5 0 0 0 .36.16h.05a.5.5 0 0 0 .36-.17L15.08 1.2a.5.5 0 0 0-.07-.73z"/>
                    <path d="M11.01.47a.5.5 0 0 0-.7.07L4.6 7.7 2.87 5.85a.5.5 0 1 0-.74.67l2.05 2.27a.5.5 0 0 0 .74-.04L11.08 1.2a.5.5 0 0 0-.07-.73z"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Input bar ── */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ backgroundColor: '#F0F2F5' }}
        >
          <span className="text-2xl select-none" aria-hidden="true">😊</span>
          <div
            className="flex-1 rounded-full px-4 py-2 text-sm"
            style={{ backgroundColor: '#fff', color: '#8696A0', direction: 'rtl' }}
          >
            הקלד הודעה...
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#00A884' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

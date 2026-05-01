'use client';

import React, { useState } from 'react';
import { parseWhatsAppExport, WhatsAppMessage } from '@/lib/whatsapp-parser';
import { Upload, FileText, AlertCircle, Loader2, Save, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const generateSlug = (dateStr: string) => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${dateStr}-${randomSuffix}`;
};

export default function AdminPage() {
  const [sender, setSender] = useState('');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sender) {
      setError(sender ? 'Please select a file' : 'Please enter sender name/number first');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedMessages = parseWhatsAppExport(text, sender);
      setMessages(parsedMessages);
      if (parsedMessages.length === 0) {
        setError('No messages found for this sender.');
      }
    } catch {
      setError('Failed to parse file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSavePost = async (index: number, msg: WhatsAppMessage) => {
    setIsSaving(index);
    setError(null);

    // Generate a simple slug and title
    const dateStr = format(msg.date, 'yyyy-MM-dd');
    const title = msg.content.split('\n')[0].substring(0, 50) || `Post from ${dateStr}`;
    const slug = generateSlug(dateStr);

    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: msg.content,
          date: msg.date.toISOString(),
          slug,
        }),
      });

      if (!res.ok) throw new Error('Failed to save to GitHub');
      
      // Remove message from list after successful save
      setMessages(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F1] text-[#0A2647] p-4 md:p-8 dir-rtl" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12 border-b border-[#7E9983]/30 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">ניהול הבלוג של אבא</h1>
            <p className="text-[#7E9983]">ייבוא הודעות וואטסאפ והפיכתן לפוסטים</p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#0A2647]/60 hover:text-[#0A2647] transition-colors self-start md:self-auto">
            חזרה לבלוג
            <ArrowRight className="w-4 h-4" />
          </Link>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#7E9983]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">זיהוי השולח (שם או מספר)</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="למשל: אבא או +972..."
                className="w-full p-3 rounded-lg border border-[#7E9983]/40 focus:ring-2 focus:ring-[#7E9983] outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!sender || isParsing}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                  !sender ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0A2647] text-white hover:bg-[#0A2647]/90'
                }`}
              >
                {isParsing ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                <span>טעינת קובץ שיחה (txt)</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">הודעות שחולצו ({messages.length})</h2>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-[#7E9983]/20 overflow-hidden hover:border-[#7E9983] transition-colors">
              <div className="bg-[#7E9983]/5 px-4 py-2 border-b border-[#7E9983]/10 flex justify-between items-center text-sm">
                <span className="font-mono text-[#7E9983]">{format(msg.date, 'dd/MM/yyyy HH:mm')}</span>
                <span className="bg-[#7E9983]/10 px-2 py-0.5 rounded text-[#7E9983]">{msg.sender}</span>
              </div>
              <div className="p-4">
                <p className="whitespace-pre-wrap text-lg leading-relaxed mb-4">{msg.content}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSavePost(index, msg)}
                    disabled={isSaving !== null}
                    className="flex items-center gap-2 bg-[#7E9983] text-white px-4 py-2 rounded-lg hover:bg-[#7E9983]/90 transition-all disabled:opacity-50"
                  >
                    {isSaving === index ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>שמירה כפוסט</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && !isParsing && (
            <div className="text-center py-20 bg-white/50 rounded-xl border-2 border-dashed border-[#7E9983]/20">
              <FileText className="mx-auto text-[#7E9983]/30 mb-4" size={48} />
              <p className="text-[#7E9983]">העלה קובץ כדי לראות הודעות כאן</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

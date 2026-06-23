'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ slug }: { slug: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts?slug=${slug}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'נכשל במחיקת הפוסט');
        setShowModal(false);
        setPassword('');
      }
    } catch {
      alert('אירעה שגיאה במחיקת הפוסט');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        className="p-2 text-muted-theme/40 hover:text-red-500 transition-colors duration-250 disabled:opacity-40"
        title="מחק פוסט"
        aria-label="מחק פוסט"
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border-theme">
            <h3 className="text-lg font-bold mb-2">אישור מחיקה</h3>
            <p className="text-sm text-muted-theme mb-4">יש להזין סיסמת מנהל כדי למחוק את הפוסט</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמת מנהל"
              className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50 mb-4"
              onKeyDown={(e) => { if (e.key === 'Enter') confirmDelete(); }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowModal(false); setPassword(''); }}
                disabled={isDeleting}
                className="flex-1 min-h-11 rounded-xl border border-border-theme bg-white/5 text-sm font-bold"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 min-h-11 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'מחק פוסט'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ slug }: { slug: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('למחוק את הפוסט? פעולה זו בלתי הפיכה.')) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts?slug=${slug}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'נכשל במחיקת הפוסט');
      }
    } catch {
      alert('אירעה שגיאה במחיקת הפוסט');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-muted-theme/40 hover:text-red-500 transition-colors duration-250 disabled:opacity-40"
      title="מחק פוסט"
      aria-label="מחק פוסט"
    >
      <Trash2 size={18} aria-hidden="true" />
    </button>
  );
}

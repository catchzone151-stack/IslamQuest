// components/CertificateButton.jsx
import React from 'react';

export default function CertificateButton({ enabled = false, onClick }) {
  return (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      style={{
        padding: '12px 18px',
        borderRadius: 14,
        border: 'none',
        cursor: enabled ? 'pointer' : 'not-allowed',
        background: enabled ? '#1d4ed8' : '#93c5fd',
        color: 'white',
        fontSize: 16,
      }}
      aria-disabled={!enabled}
      aria-label="عرض الشهادة"
      title={enabled ? 'عرض الشهادة' : 'أكمل الدروس للحصول على الشهادة'}
    >
      الشهادة
    </button>
  );
}
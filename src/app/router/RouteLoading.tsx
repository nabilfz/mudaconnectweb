import React from 'react';

export const RouteLoading: React.FC = () => (
  <div
    className="route-loading"
    role="status"
    aria-live="polite"
    aria-label="Memuat halaman"
  >
    <span className="route-loading__mark" aria-hidden="true">
      M
    </span>
    <span>Menyiapkan halaman…</span>
  </div>
);

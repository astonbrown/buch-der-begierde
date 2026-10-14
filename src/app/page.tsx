'use client';

import { useEffect } from 'react';

/**
 * Redirect to the static Buch der Begierde site
 * (Vanilla HTML/JS/CSS from GitHub repo)
 */
export default function RedirectPage() {
  useEffect(() => {
    window.location.replace('/index.html');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      color: '#e8dcc8',
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '1.2rem',
    }}>
      Lade Buch der Begierde…
    </div>
  );
}

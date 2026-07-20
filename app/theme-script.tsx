export function ThemeScript() {
  const script = `
    (function() {
      try {
        var t = localStorage.getItem('tayamo-theme');
        if (t === 'classic' || t === 'gold') {
          document.documentElement.setAttribute('data-theme', t);
        } else {
          document.documentElement.setAttribute('data-theme', 'gold');
        }
      } catch(e) {
        document.documentElement.setAttribute('data-theme', 'gold');
      }
    })();
  `;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}

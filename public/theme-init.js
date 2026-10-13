// Applies the saved theme before first paint (external file so it works under a strict CSP).
try {
  var t = localStorage.getItem('theme')
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t)
} catch (e) {}

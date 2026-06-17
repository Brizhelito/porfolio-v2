fetch('http://localhost:4321/')
  .then(r => r.text())
  .then(html => {
    // Check global.css style block content
    const globalIdx = html.indexOf('global.css');
    if (globalIdx !== -1) {
      const styleStart = html.lastIndexOf('<style', globalIdx);
      const styleEnd = html.indexOf('</style>', globalIdx);
      const content = html.substring(styleStart, styleEnd + 8);
      console.log('=== GLOBAL CSS STYLE BLOCK (first 3000 chars) ===');
      console.log(content.substring(0, 3000));
    }
    
    // Check if Tailwind classes are compiled
    const hasTailwind = html.includes('tailwind') || html.includes('@layer') || html.includes('.flex');
    console.log('\n=== Has Tailwind indicators:', hasTailwind, '===');
    
    // Check for any error messages in the HTML
    const errorIdx = html.indexOf('Error');
    if (errorIdx !== -1) {
      console.log('\n=== Error found in HTML ===');
      console.log(html.substring(Math.max(0, errorIdx - 100), errorIdx + 500));
    }
  });

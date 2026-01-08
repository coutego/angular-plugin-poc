const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist', 'angular-plugin-poc', 'browser');
const OUTPUT_FILE = path.join(__dirname, '..', 'dist', 'app-standalone.html');

function bundleSingleHtml() {
  console.log('📦 Bundling into single HTML file...');

  // Read the index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Build output not found. Run "npm run build" first.');
    process.exit(1);
  }

  let html = fs.readFileSync(indexPath, 'utf-8');

  // Remove or fix the base href for file:// protocol compatibility
  // Replace <base href="/"> with a base that works for file:// or remove it entirely
  html = html.replace(/<base\s+href="[^"]*"\s*\/?>/gi, '');

  // Find and inline all CSS files
  const cssLinkRegex = /<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>/gi;
  let cssMatch;
  const cssMatches = [];
  
  while ((cssMatch = cssLinkRegex.exec(html)) !== null) {
    cssMatches.push({ full: cssMatch[0], href: cssMatch[1] });
  }

  for (const match of cssMatches) {
    const cssPath = path.join(DIST_DIR, match.href);
    
    if (fs.existsSync(cssPath)) {
      console.log(`  ✓ Inlining CSS: ${match.href}`);
      let cssContent = fs.readFileSync(cssPath, 'utf-8');
      
      // Handle any url() references in CSS (fonts, images)
      cssContent = inlineUrlReferences(cssContent, DIST_DIR);
      
      const styleTag = `<style>${cssContent}</style>`;
      html = html.replace(match.full, styleTag);
    }
  }

  // Find and inline all JS files
  const jsScriptRegex = /<script\s+src="([^"]+)"[^>]*><\/script>/gi;
  let jsMatch;
  const jsMatches = [];
  
  // Collect all matches first (to avoid regex issues with replacement)
  while ((jsMatch = jsScriptRegex.exec(html)) !== null) {
    jsMatches.push({ full: jsMatch[0], src: jsMatch[1] });
  }

  for (const match of jsMatches) {
    const jsPath = path.join(DIST_DIR, match.src);
    
    if (fs.existsSync(jsPath)) {
      console.log(`  ✓ Inlining JS: ${match.src}`);
      const jsContent = fs.readFileSync(jsPath, 'utf-8');
      
      // Determine script type from original tag
      const isModule = match.full.includes('type="module"');
      const scriptTag = isModule 
        ? `<script type="module">${jsContent}</script>`
        : `<script>${jsContent}</script>`;
      
      html = html.replace(match.full, scriptTag);
    }
  }

  // Inline favicon if present
  const faviconRegex = /<link\s+rel="icon"\s+[^>]*href="([^"]+)"[^>]*>/i;
  const faviconMatch = html.match(faviconRegex);
  if (faviconMatch) {
    const faviconHref = faviconMatch[1];
    const faviconPath = path.join(DIST_DIR, faviconHref);
    
    if (fs.existsSync(faviconPath)) {
      console.log(`  ✓ Inlining favicon: ${faviconHref}`);
      const faviconBuffer = fs.readFileSync(faviconPath);
      const faviconBase64 = faviconBuffer.toString('base64');
      const mimeType = getMimeType(faviconHref);
      const faviconDataUri = `data:${mimeType};base64,${faviconBase64}`;
      
      html = html.replace(
        faviconMatch[0],
        `<link rel="icon" href="${faviconDataUri}">`
      );
    }
  }

  // Remove any remaining external resource references that couldn't be inlined
  html = html.replace(/<link\s+rel="modulepreload"[^>]*>/gi, '');
  
  // Add a comment indicating this is a standalone build
  html = html.replace(
    '<head>',
    `<head>
  <!-- Standalone single-file build - Generated ${new Date().toISOString()} -->`
  );

  // Write the bundled HTML
  fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
  
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('');
  console.log(`✅ Single HTML file created: ${OUTPUT_FILE}`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log('');
  console.log('📧 You can now send this file via email or share it directly.');
  console.log('   Users just need to open it in a web browser.');
}

function inlineUrlReferences(css, baseDir) {
  // Match url() references in CSS
  const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
  
  return css.replace(urlRegex, (match, url) => {
    // Skip data URIs and external URLs
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return match;
    }
    
    // Handle relative paths
    const assetPath = path.join(baseDir, url);
    
    if (fs.existsSync(assetPath)) {
      const buffer = fs.readFileSync(assetPath);
      const base64 = buffer.toString('base64');
      const mimeType = getMimeType(url);
      return `url('data:${mimeType};base64,${base64}')`;
    }
    
    return match;
  });
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Run the bundler
bundleSingleHtml();

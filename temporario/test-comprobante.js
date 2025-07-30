// Script para probar el botón "Ver comprobante"
// Copia y pega esto en la consola del navegador (F12)

console.log('🧪 PROBANDO BOTÓN "VER COMPROBANTE"');

// Verificar si hay botones de "Ver comprobante" en la página
const comprobanteButtons = document.querySelectorAll('button, a');
const comprobanteElements = [];

comprobanteButtons.forEach(element => {
  const text = element.textContent || element.innerText;
  if (text.toLowerCase().includes('comprobante')) {
    comprobanteElements.push({
      element: element,
      text: text.trim(),
      tagName: element.tagName,
      href: element.href || null,
      onClick: element.onclick || null
    });
  }
});

console.log('📊 Elementos de comprobante encontrados:', comprobanteElements.length);

comprobanteElements.forEach((item, index) => {
  console.log(`\n${index + 1}. Elemento:`, {
    text: item.text,
    tagName: item.tagName,
    href: item.href,
    hasOnClick: !!item.onClick
  });
});

// Verificar si hay enlaces directos a PDFs
const pdfLinks = document.querySelectorAll('a[href*=".pdf"], a[href*="data:"], a[target="_blank"]');
console.log('\n📄 Enlaces a PDFs encontrados:', pdfLinks.length);

pdfLinks.forEach((link, index) => {
  console.log(`${index + 1}. Enlace:`, {
    href: link.href,
    target: link.target,
    text: link.textContent?.trim()
  });
});

// Simular clic en el primer botón de comprobante si existe
if (comprobanteElements.length > 0) {
  console.log('\n🖱️ Simulando clic en el primer botón de comprobante...');
  const firstButton = comprobanteElements[0].element;
  
  // Verificar si es un enlace directo
  if (firstButton.tagName === 'A' && firstButton.href) {
    console.log('✅ Es un enlace directo, debería abrir el PDF');
    console.log('URL:', firstButton.href);
  } else {
    console.log('⚠️ Es un botón, verificando funcionalidad...');
  }
  
  // No ejecutar el clic automáticamente por seguridad
  console.log('💡 Para probar: haz clic manualmente en el botón "Ver comprobante"');
}

console.log('\n✅ Análisis completado');
console.log('💡 Si el botón no abre el PDF directamente, el problema puede estar en:');
console.log('   - El navegador bloqueando popups');
console.log('   - La URL del PDF no es válida');
console.log('   - El archivo PDF no existe'); 
// Script para probar que los botones "Ver comprobante" funcionen correctamente
// Copia y pega esto en la consola del navegador (F12)

console.log('🧪 PROBANDO BOTONES "VER COMPROBANTE" CORREGIDOS');

// 1. Verificar si hay botones de "Ver comprobante" en la página
const comprobanteButtons = document.querySelectorAll('button');
const comprobanteElements = [];

comprobanteButtons.forEach(element => {
  const text = element.textContent || element.innerText;
  if (text.toLowerCase().includes('comprobante')) {
    comprobanteElements.push({
      element: element,
      text: text.trim(),
      tagName: element.tagName,
      onClick: element.onclick || null
    });
  }
});

console.log('📊 Botones de comprobante encontrados:', comprobanteElements.length);

comprobanteElements.forEach((item, index) => {
  console.log(`\n${index + 1}. Botón:`, {
    text: item.text,
    tagName: item.tagName,
    hasOnClick: !!item.onClick
  });
});

// 2. Verificar si hay enlaces a PDFs (facturas)
const pdfLinks = document.querySelectorAll('a[href*=".pdf"], a[target="_blank"]');
console.log('\n📄 Enlaces a PDFs encontrados:', pdfLinks.length);

pdfLinks.forEach((link, index) => {
  console.log(`${index + 1}. Enlace:`, {
    href: link.href,
    target: link.target,
    text: link.textContent?.trim()
  });
});

// 3. Verificar si hay data URLs en la página
const dataUrlElements = document.querySelectorAll('*');
const dataUrls = [];

dataUrlElements.forEach(element => {
  const attributes = element.attributes;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.value && attr.value.startsWith('data:')) {
      dataUrls.push({
        element: element,
        attribute: attr.name,
        value: attr.value.substring(0, 50) + '...'
      });
    }
  }
});

console.log('\n🔗 Data URLs encontradas:', dataUrls.length);
dataUrls.forEach((item, index) => {
  console.log(`${index + 1}. Data URL:`, {
    element: item.element.tagName,
    attribute: item.attribute,
    value: item.value
  });
});

// 4. Simular clic en el primer botón de comprobante si existe
if (comprobanteElements.length > 0) {
  console.log('\n🖱️ Simulando clic en el primer botón de comprobante...');
  const firstButton = comprobanteElements[0].element;
  
  console.log('✅ Botón encontrado, simulando clic...');
  console.log('💡 Para probar: haz clic manualmente en el botón "Ver comprobante"');
  
  // Verificar si el botón tiene onClick
  if (firstButton.onclick) {
    console.log('✅ El botón tiene función onClick configurada');
  } else {
    console.log('⚠️ El botón NO tiene función onClick configurada');
  }
}

console.log('\n✅ Análisis completado');
console.log('💡 Si el botón no abre el PDF, verifica:');
console.log('   - Que el comprobante esté cargado correctamente');
console.log('   - Que la función openReceipt esté funcionando');
console.log('   - Que no haya errores en la consola'); 
# Script PowerShell para limpiar mensajes viejos del chat
Write-Host "Iniciando limpieza de mensajes viejos..." -ForegroundColor Green

# 1. Verificar que el servidor esté corriendo
Write-Host "Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/status" -Method GET
    Write-Host "Servidor funcionando" -ForegroundColor Green
} catch {
    Write-Host "Servidor no disponible. Asegurate de que este corriendo en puerto 3001" -ForegroundColor Red
    exit 1
}

# 2. Limpiar mensajes de Supabase
Write-Host "Limpiando mensajes de Supabase..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method DELETE
    Write-Host "Mensajes de Supabase eliminados: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "No se pudieron limpiar mensajes de Supabase (puede no estar configurado)" -ForegroundColor Yellow
}

# 3. Instrucciones para el usuario
Write-Host "`nInstrucciones para completar la limpieza:" -ForegroundColor Cyan
Write-Host "1. Abre el navegador en http://localhost:3001" -ForegroundColor White
Write-Host "2. Abre las herramientas de desarrollador (F12)" -ForegroundColor White
Write-Host "3. Ve a la pestaña Console" -ForegroundColor White
Write-Host "4. Copia y pega el siguiente codigo:" -ForegroundColor White
Write-Host "`n" -ForegroundColor White

$scriptCode = @"
// Limpiar localStorage
const keysToClean = [
  'whatsapp-messages-by-contact',
  'whatsapp-messages-1',
  'whatsapp-messages-2',
  'whatsapp-messages-3',
  'whatsapp-messages-4',
  'whatsapp-messages-5'
];

console.log('Limpiando localStorage...');
keysToClean.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('Eliminado: ' + key);
  }
});

console.log('Recargando pagina...');
setTimeout(() => {
  window.location.reload();
}, 1000);
"@

Write-Host $scriptCode -ForegroundColor Gray
Write-Host "`nLimpieza completada!" -ForegroundColor Green 
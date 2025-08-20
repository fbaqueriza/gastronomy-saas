# Script de Prueba - Mensajes Instantáneos
# Fecha: 14/08/2025 18:30

Write-Host "Probando mensajes instantáneos..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    exit 1
}

# PASO 2: Verificar buffer
Write-Host "Verificando buffer de mensajes..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sync-buffer" -Method POST -TimeoutSec 5
    Write-Host "Buffer funcionando: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error verificando buffer" -ForegroundColor Red
}

# PASO 3: Instrucciones para probar mensajes instantáneos
Write-Host ""
Write-Host "Para probar mensajes instantáneos:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "3. Esperar que aparezca 'SSE conectado exitosamente'" -ForegroundColor White
Write-Host "4. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "5. El mensaje debe aparecer INSTANTÁNEAMENTE (sin delay)" -ForegroundColor White

Write-Host ""
Write-Host "Mejoras implementadas:" -ForegroundColor Green
Write-Host "- Envío instantáneo sin delays" -ForegroundColor White
Write-Host "- Sincronización cada 5 segundos" -ForegroundColor White
Write-Host "- Buffer de 20 mensajes" -ForegroundColor White
Write-Host "- Reconexión automática instantánea" -ForegroundColor White

Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- Los mensajes deben llegar INSTANTÁNEAMENTE" -ForegroundColor White
Write-Host "- Si hay delay, el sistema no está funcionando correctamente" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

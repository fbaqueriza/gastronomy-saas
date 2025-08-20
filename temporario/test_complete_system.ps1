# Script de Prueba - Sistema Completo WhatsApp
# Fecha: 14/08/2025 18:35

Write-Host "Probando sistema completo de WhatsApp..." -ForegroundColor Yellow

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

# PASO 3: Verificar endpoint de marcar como leído
Write-Host "Verificando endpoint de marcar como leído..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/mark-as-read" -Method POST -Body '{"contactId":"+5491135562673"}' -ContentType "application/json" -TimeoutSec 5
    Write-Host "Endpoint de marcar como leído funcionando: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error verificando endpoint de marcar como leído" -ForegroundColor Red
}

# PASO 4: Instrucciones para probar el sistema completo
Write-Host ""
Write-Host "Para probar el sistema completo:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "3. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "4. Esperar que aparezca 'SSE conectado exitosamente'" -ForegroundColor White
Write-Host "5. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "6. El mensaje debe aparecer INSTANTÁNEAMENTE" -ForegroundColor White
Write-Host "7. Si el chat está cerrado, debe aparecer una notificación push" -ForegroundColor White
Write-Host "8. El contador de mensajes no leídos debe incrementarse" -ForegroundColor White

Write-Host ""
Write-Host "Características implementadas:" -ForegroundColor Green
Write-Host "- Mensajes instantáneos sin delay" -ForegroundColor White
Write-Host "- Push notifications automáticas" -ForegroundColor White
Write-Host "- Contador de mensajes no leídos" -ForegroundColor White
Write-Host "- Marcar como leído automáticamente" -ForegroundColor White
Write-Host "- Sincronización cada 5 segundos" -ForegroundColor White
Write-Host "- Reconexión automática" -ForegroundColor White

Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- Los mensajes deben llegar INSTANTÁNEAMENTE" -ForegroundColor White
Write-Host "- Las notificaciones push deben aparecer si el chat está cerrado" -ForegroundColor White
Write-Host "- El contador de no leídos debe funcionar correctamente" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

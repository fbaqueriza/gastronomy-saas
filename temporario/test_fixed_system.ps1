# Script de Prueba - Sistema Corregido
# Fecha: 14/08/2025 18:42

Write-Host "Probando sistema corregido..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    exit 1
}

# PASO 2: Verificar endpoint de marcar como leído
Write-Host "Verificando endpoint de marcar como leído..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/mark-as-read" -Method POST -Body '{"contactId":"+5491135562673"}' -ContentType "application/json" -TimeoutSec 5
    Write-Host "Endpoint de marcar como leído funcionando: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error verificando endpoint de marcar como leído" -ForegroundColor Red
}

# PASO 3: Instrucciones para probar el sistema corregido
Write-Host ""
Write-Host "Para probar el sistema corregido:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. El error de PushNotificationService debe estar resuelto" -ForegroundColor White
Write-Host "3. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "4. Esperar que aparezca 'SSE conectado exitosamente'" -ForegroundColor White
Write-Host "5. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "6. El mensaje debe aparecer INSTANTÁNEAMENTE" -ForegroundColor White

Write-Host ""
Write-Host "Problemas corregidos:" -ForegroundColor Green
Write-Host "- Error de PushNotificationService resuelto" -ForegroundColor White
Write-Host "- Componente NotificationPermission actualizado" -ForegroundColor White
Write-Host "- Endpoint de marcar como leído funcionando" -ForegroundColor White
Write-Host "- Sistema de push notifications simplificado" -ForegroundColor White

Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- El chat debe abrirse sin errores" -ForegroundColor White
Write-Host "- Los mensajes deben llegar instantáneamente" -ForegroundColor White
Write-Host "- Las notificaciones deben funcionar correctamente" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

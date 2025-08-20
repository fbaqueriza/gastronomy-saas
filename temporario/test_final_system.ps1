# Script de Prueba Final - Sistema Completo
# Fecha: 14/08/2025 19:13

Write-Host "Probando sistema completo..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    exit 1
}

# PASO 2: Instrucciones para probar
Write-Host ""
Write-Host "Para probar el sistema completo:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "4. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "5. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "6. Verificar en la consola los logs del servidor:" -ForegroundColor White
Write-Host "   - '📥 Webhook POST - Recibiendo mensaje entrante...'" -ForegroundColor Gray
Write-Host "   - '📤 Webhook POST - Enviando mensaje SSE INSTANTANEAMENTE'" -ForegroundColor Gray
Write-Host "   - '📤 Enviando mensaje SSE a X clientes INSTANTANEAMENTE'" -ForegroundColor Gray
Write-Host "7. Verificar en la consola del navegador:" -ForegroundColor White
Write-Host "   - '📨 SSE - Tipo de mensaje: whatsapp_message'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - Mensaje WhatsApp recibido en tiempo real'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - Agregando mensaje INSTANTANEAMENTE'" -ForegroundColor Gray

Write-Host ""
Write-Host "COMPORTAMIENTO ESPERADO:" -ForegroundColor Green
Write-Host "- Mensajes llegan INSTANTANEAMENTE sin delay" -ForegroundColor White
Write-Host "- Chat scrollea automáticamente al final" -ForegroundColor White
Write-Host "- Notificaciones aparecen en conversaciones no activas" -ForegroundColor White
Write-Host "- Contador se incrementa correctamente" -ForegroundColor White
Write-Host "- Indicador visual aparece en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "SI NO FUNCIONA:" -ForegroundColor Red
Write-Host "1. Verificar que el webhook esté configurado correctamente" -ForegroundColor White
Write-Host "2. Verificar que ngrok esté funcionando" -ForegroundColor White
Write-Host "3. Verificar que los mensajes lleguen al servidor" -ForegroundColor White
Write-Host "4. Verificar que SSE esté enviando los mensajes" -ForegroundColor White
Write-Host "5. Verificar que el frontend esté procesando los mensajes" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

# Script de Prueba - Sistema Funcionando
# Fecha: 14/08/2025 19:17

Write-Host "Probando sistema funcionando..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
} catch {
    Write-Host "Servidor no responde - Esperando que inicie..." -ForegroundColor Red
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
        Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
    } catch {
        Write-Host "Servidor aún no responde" -ForegroundColor Red
        exit 1
    }
}

# PASO 2: Instrucciones para probar
Write-Host ""
Write-Host "Para probar el sistema funcionando:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "4. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "5. Verificar en la consola que aparezca:" -ForegroundColor White
Write-Host "   - '✅ SSE conectado exitosamente'" -ForegroundColor Gray
Write-Host "   - '🔔 Chat conectado exitosamente'" -ForegroundColor Gray
Write-Host "6. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "7. Verificar en la consola del servidor:" -ForegroundColor White
Write-Host "   - '📥 Webhook POST - Recibiendo mensaje entrante...'" -ForegroundColor Gray
Write-Host "   - '📤 Webhook POST - Enviando mensaje SSE INSTANTANEAMENTE'" -ForegroundColor Gray
Write-Host "   - '📤 Enviando mensaje SSE a 1 clientes INSTANTANEAMENTE'" -ForegroundColor Gray
Write-Host "8. Verificar en la consola del navegador:" -ForegroundColor White
Write-Host "   - '📨 SSE - Tipo de mensaje: whatsapp_message'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - Mensaje WhatsApp recibido en tiempo real'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - Agregando mensaje INSTANTANEAMENTE'" -ForegroundColor Gray

Write-Host ""
Write-Host "COMPORTAMIENTO ESPERADO:" -ForegroundColor Green
Write-Host "- Cliente SSE conectado (clientCount: 1)" -ForegroundColor White
Write-Host "- Mensajes llegan INSTANTANEAMENTE sin delay" -ForegroundColor White
Write-Host "- Chat scrollea automáticamente al final" -ForegroundColor White
Write-Host "- Notificaciones aparecen en conversaciones no activas" -ForegroundColor White
Write-Host "- Contador se incrementa correctamente" -ForegroundColor White
Write-Host "- Indicador visual aparece en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "SI NO FUNCIONA:" -ForegroundColor Red
Write-Host "1. Verificar que el navegador esté conectado al SSE" -ForegroundColor White
Write-Host "2. Verificar que el webhook esté configurado correctamente" -ForegroundColor White
Write-Host "3. Verificar que ngrok esté funcionando" -ForegroundColor White
Write-Host "4. Verificar que los mensajes lleguen al servidor" -ForegroundColor White
Write-Host "5. Verificar que SSE esté enviando los mensajes" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

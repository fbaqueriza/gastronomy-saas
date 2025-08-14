# Script de Prueba - Debug Mensajes SSE
# Fecha: 14/08/2025 19:10

Write-Host "Debuggeando mensajes SSE..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
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

# PASO 2: Instrucciones para debuggear
Write-Host ""
Write-Host "Para debuggear los mensajes SSE:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "4. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "5. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "6. Verificar en la consola los logs:" -ForegroundColor White
Write-Host "   - '📨 SSE - Tipo de mensaje: whatsapp_message'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - ContactId: +5491135562673'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - Mensaje WhatsApp recibido en tiempo real'" -ForegroundColor Gray
Write-Host "   - '📨 SSE - Agregando mensaje INSTANTANEAMENTE'" -ForegroundColor Gray

Write-Host ""
Write-Host "PROBLEMAS A VERIFICAR:" -ForegroundColor Red
Write-Host "- ¿Aparece 'Tipo de mensaje: whatsapp_message'?" -ForegroundColor White
Write-Host "- ¿Aparece 'ContactId: +5491135562673'?" -ForegroundColor White
Write-Host "- ¿Se procesa el mensaje correctamente?" -ForegroundColor White
Write-Host "- ¿Aparece en el chat?" -ForegroundColor White

Write-Host ""
Write-Host "Si no aparecen los logs correctos:" -ForegroundColor Yellow
Write-Host "- Verificar que el webhook esté funcionando" -ForegroundColor White
Write-Host "- Verificar que los mensajes lleguen al servidor" -ForegroundColor White
Write-Host "- Verificar que SSE esté enviando los mensajes" -ForegroundColor White

Write-Host ""
Write-Host "Debug completado." -ForegroundColor Green

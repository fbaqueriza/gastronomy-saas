# Script de Prueba - Conexión Constante como WhatsApp
# Fecha: 14/08/2025 19:50

Write-Host "Probando conexión CONSTANTE como WhatsApp..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
    
    if ($response.clientCount -gt 0) {
        Write-Host "✅ ¡CLIENTE SSE CONECTADO!" -ForegroundColor Green
    } else {
        Write-Host "❌ No hay clientes SSE conectados" -ForegroundColor Red
    }
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    exit 1
}

# PASO 2: Instrucciones para probar
Write-Host ""
Write-Host "¡PRUEBA LA CONEXIÓN CONSTANTE!" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "4. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "5. Verificar en la consola que aparezca:" -ForegroundColor White
Write-Host "   - '🔗 ChatContext - Conectando SSE de forma CONSTANTE...'" -ForegroundColor Gray
Write-Host "   - '✅ SSE conectado de forma CONSTANTE'" -ForegroundColor Gray
Write-Host "   - '🔔 Chat conectado exitosamente'" -ForegroundColor Gray
Write-Host "6. ENVIAR MENSAJE DESDE WHATSAPP" -ForegroundColor Green
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
Write-Host "- Conexión SSE CONSTANTE sin reconexiones periódicas" -ForegroundColor White
Write-Host "- Mensajes llegan INSTANTANEAMENTE sin delay" -ForegroundColor White
Write-Host "- Chat scrollea automáticamente al final" -ForegroundColor White
Write-Host "- Notificaciones aparecen en conversaciones no activas" -ForegroundColor White
Write-Host "- Contador se incrementa correctamente" -ForegroundColor White
Write-Host "- Indicador visual aparece en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "ARREGLOS IMPLEMENTADOS:" -ForegroundColor Green
Write-Host "- Conexión SSE CONSTANTE como WhatsApp" -ForegroundColor White
Write-Host "- SIN reconexiones periódicas" -ForegroundColor White
Write-Host "- Reconexión automática solo en caso de error" -ForegroundColor White
Write-Host "- Mensajes instantáneos sin delay" -ForegroundColor White
Write-Host "- Notificaciones mejoradas" -ForegroundColor White
Write-Host "- Scroll automático optimizado" -ForegroundColor White

Write-Host ""
Write-Host "¡AHORA DEBERÍA FUNCIONAR COMO WHATSAPP REAL!" -ForegroundColor Green
Write-Host "Prueba completada." -ForegroundColor Green

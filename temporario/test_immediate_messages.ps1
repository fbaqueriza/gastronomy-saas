# Script de Prueba - Mensajes Inmediatos
# Fecha: 14/08/2025 18:59

Write-Host "Probando sistema de mensajes inmediatos..." -ForegroundColor Yellow

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
Write-Host "Para probar el sistema mejorado:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "4. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "5. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "6. El mensaje debe aparecer INMEDIATAMENTE sin delay" -ForegroundColor White
Write-Host "7. El chat debe scrollear automáticamente al final" -ForegroundColor White
Write-Host "8. Cerrar el chat y enviar otro mensaje" -ForegroundColor White
Write-Host "9. Debe aparecer notificación push + alerta en pantalla" -ForegroundColor White
Write-Host "10. El contador debe incrementarse en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "Mejoras implementadas:" -ForegroundColor Green
Write-Host "- Eliminada sincronización periódica (mensajes inmediatos)" -ForegroundColor White
Write-Host "- Notificaciones en conversaciones no activas" -ForegroundColor White
Write-Host "- Scroll automático mejorado (sin delay)" -ForegroundColor White
Write-Host "- Alertas visuales en pantalla además de push" -ForegroundColor White
Write-Host "- Lógica de contador mejorada" -ForegroundColor White
Write-Host "- Indicador visual animado" -ForegroundColor White

Write-Host ""
Write-Host "LOGS A VERIFICAR:" -ForegroundColor Red
Write-Host "- '📨 Incrementando contador para...'" -ForegroundColor Gray
Write-Host "- '🔔 Enviando notificación push...'" -ForegroundColor Gray
Write-Host "- '🔔 Push notification enviada exitosamente'" -ForegroundColor Gray
Write-Host "- '✅ Mensaje enviado INSTANTANEAMENTE'" -ForegroundColor Gray

Write-Host ""
Write-Host "COMPORTAMIENTO ESPERADO:" -ForegroundColor Yellow
Write-Host "- Mensajes llegan INSTANTÁNEAMENTE sin delay" -ForegroundColor White
Write-Host "- Chat scrollea automáticamente al final" -ForegroundColor White
Write-Host "- Notificaciones aparecen en conversaciones no activas" -ForegroundColor White
Write-Host "- Contador se incrementa correctamente" -ForegroundColor White
Write-Host "- Indicador visual aparece en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

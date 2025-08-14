# Script de Prueba - Debug Notificaciones
# Fecha: 14/08/2025 18:52

Write-Host "Debuggeando sistema de notificaciones..." -ForegroundColor Yellow

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

# PASO 3: Instrucciones para debuggear
Write-Host ""
Write-Host "Para debuggear el sistema:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12)" -ForegroundColor White
Write-Host "3. Ir a la pestaña Console" -ForegroundColor White
Write-Host "4. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "5. Ir al dashboard y CERRAR el chat" -ForegroundColor White
Write-Host "6. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "7. Verificar en la consola los logs:" -ForegroundColor White
Write-Host "   - '📨 Incrementando contador para...'" -ForegroundColor Gray
Write-Host "   - '🔔 Enviando notificación push...'" -ForegroundColor Gray
Write-Host "   - '🔔 Push notification enviada exitosamente'" -ForegroundColor Gray
Write-Host "8. Verificar que aparece el indicador rojo en el botón del chat" -ForegroundColor White
Write-Host "9. Verificar que el título de la página cambia a '(1) Gastrosaas'" -ForegroundColor White

Write-Host ""
Write-Host "Mejoras implementadas:" -ForegroundColor Green
Write-Host "- Logs detallados para debuggear notificaciones" -ForegroundColor White
Write-Host "- Indicador animado en el botón del chat" -ForegroundColor White
Write-Host "- Título de página dinámico con contador" -ForegroundColor White
Write-Host "- Notificaciones más persistentes (10 segundos)" -ForegroundColor White
Write-Host "- Tooltip mejorado en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "PROBLEMAS A VERIFICAR:" -ForegroundColor Red
Write-Host "- ¿Aparecen los logs en la consola?" -ForegroundColor White
Write-Host "- ¿Se incrementa el contador correctamente?" -ForegroundColor White
Write-Host "- ¿Aparecen las notificaciones push?" -ForegroundColor White
Write-Host "- ¿Se muestra el indicador visual?" -ForegroundColor White
Write-Host "- ¿Cambia el título de la página?" -ForegroundColor White

Write-Host ""
Write-Host "Si no funcionan las notificaciones:" -ForegroundColor Yellow
Write-Host "- Verificar que el navegador permite notificaciones" -ForegroundColor White
Write-Host "- Verificar que el chat esté CERRADO" -ForegroundColor White
Write-Host "- Verificar que el contacto no esté seleccionado" -ForegroundColor White
Write-Host "- Revisar la consola para errores" -ForegroundColor White

Write-Host ""
Write-Host "Debug completado." -ForegroundColor Green

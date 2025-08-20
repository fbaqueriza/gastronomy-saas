# Script de Prueba - SSE Optimizado
# Fecha: 14/08/2025 20:00

Write-Host "¡SISTEMA SSE OPTIMIZADO!" -ForegroundColor Green

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
Write-Host "¡PRUEBA EL SSE OPTIMIZADO!" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Permitir notificaciones cuando el navegador lo solicite" -ForegroundColor White
Write-Host "4. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "5. Verificar en la consola que aparezca:" -ForegroundColor White
Write-Host "   - '🔗 ChatContext - Iniciando conexión SSE optimizada...'" -ForegroundColor Gray
Write-Host "   - '✅ SSE conectado exitosamente - Conexión estable'" -ForegroundColor Gray
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
Write-Host "- Conexión SSE estable y optimizada" -ForegroundColor White
Write-Host "- Mensajes llegan INSTANTANEAMENTE sin delay" -ForegroundColor White
Write-Host "- Reconexión automática en caso de error" -ForegroundColor White
Write-Host "- Chat scrollea automáticamente al final" -ForegroundColor White
Write-Host "- Notificaciones aparecen en conversaciones no activas" -ForegroundColor White
Write-Host "- Contador se incrementa correctamente" -ForegroundColor White
Write-Host "- Indicador visual aparece en el botón del chat" -ForegroundColor White

Write-Host ""
Write-Host "MEJORES PRÁCTICAS IMPLEMENTADAS:" -ForegroundColor Green
Write-Host "- Conexión SSE optimizada con control de estado" -ForegroundColor White
Write-Host "- Prevención de conexiones múltiples simultáneas" -ForegroundColor White
Write-Host "- Reconexión automática con backoff exponencial" -ForegroundColor White
Write-Host "- Limpieza adecuada de recursos" -ForegroundColor White
Write-Host "- Manejo robusto de errores" -ForegroundColor White
Write-Host "- Sincronización automática del buffer" -ForegroundColor White
Write-Host "- Procesamiento instantáneo de mensajes" -ForegroundColor White

Write-Host ""
Write-Host "¡AHORA DEBERÍA FUNCIONAR PERFECTAMENTE!" -ForegroundColor Green
Write-Host "Prueba completada." -ForegroundColor Green

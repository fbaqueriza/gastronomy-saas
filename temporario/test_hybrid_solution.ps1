# Script de Prueba - Arquitectura Híbrida SSE + Polling
Write-Host "🧠 ARQUITECTURA HÍBRIDA - SSE + POLLING INTELIGENTE" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 DIAGNÓSTICO DE LA NUEVA SOLUCIÓN:" -ForegroundColor Yellow
Write-Host "1. SSE para mensajes en tiempo real" -ForegroundColor White
Write-Host "2. Polling como respaldo cuando SSE falla" -ForegroundColor White
Write-Host "3. Resistente a Fast Refresh de Next.js" -ForegroundColor White
Write-Host "4. Polling inteligente con timestamp" -ForegroundColor White

Write-Host ""
Write-Host "📊 Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
    
    if ($response.clientCount -gt 0) {
        Write-Host "✅ ¡CLIENTE SSE CONECTADO!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No hay clientes SSE (modo polling activo)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Servidor no responde" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 PROBANDO ENDPOINT DE MENSAJES..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET -TimeoutSec 5
    Write-Host "✅ Endpoint de mensajes funcionando" -ForegroundColor Green
    Write-Host "   Mensajes disponibles: $($response.count)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint de mensajes no responde" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 INSTRUCCIONES PARA PROBAR:" -ForegroundColor Green
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "4. Verificar en la consola:" -ForegroundColor White
Write-Host "   - '🔗 ChatContext - Iniciando conexión SSE híbrida...'" -ForegroundColor Gray
Write-Host "   - '✅ SSE conectado exitosamente - Modo híbrido'" -ForegroundColor Gray
Write-Host "   - '📨 Polling - Mensajes nuevos encontrados:' (si hay mensajes)" -ForegroundColor Gray
Write-Host "5. ENVIAR MENSAJE DESDE WHATSAPP" -ForegroundColor Green
Write-Host "6. Verificar que llegue por SSE O por polling" -ForegroundColor White

Write-Host ""
Write-Host "💡 VENTAJAS DE LA ARQUITECTURA HÍBRIDA:" -ForegroundColor Green
Write-Host "- Resistente a Fast Refresh" -ForegroundColor White
Write-Host "- Mensajes llegan SIEMPRE (SSE o polling)" -ForegroundColor White
Write-Host "- Polling inteligente con timestamp" -ForegroundColor White
Write-Host "- Sin reconexiones constantes" -ForegroundColor White
Write-Host "- Funciona como WhatsApp real" -ForegroundColor White

Write-Host ""
Write-Host "🚀 ¡SOLUCIÓN CREATIVA IMPLEMENTADA!" -ForegroundColor Green
Write-Host "Prueba completada." -ForegroundColor Green

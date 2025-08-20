# Script de Diagnóstico SSE
Write-Host "🔍 DIAGNÓSTICO SSE - Verificando estado completo..." -ForegroundColor Yellow

Write-Host ""
Write-Host "1. Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor funcionando" -ForegroundColor Green
    Write-Host "   Clientes SSE conectados: $($response.clientCount)" -ForegroundColor White
    
    if ($response.clientCount -gt 0) {
        Write-Host "✅ ¡CLIENTE SSE CONECTADO!" -ForegroundColor Green
    } else {
        Write-Host "❌ No hay clientes SSE conectados" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Servidor no responde" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Verificando endpoint SSE..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse" -Method GET -TimeoutSec 3
    Write-Host "✅ Endpoint SSE responde" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint SSE no responde" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verificando sync-buffer..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sync-buffer" -Method POST -TimeoutSec 5
    Write-Host "✅ Sync-buffer responde: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Sync-buffer no responde" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 DIAGNÓSTICO COMPLETO:" -ForegroundColor Yellow
Write-Host "Si el servidor muestra 0 clientes pero el frontend dice estar conectado:" -ForegroundColor White
Write-Host "1. Hay un problema de sincronización entre frontend y backend" -ForegroundColor Red
Write-Host "2. El frontend se está reconectando constantemente" -ForegroundColor Red
Write-Host "3. Los mensajes se están enviando a 0 clientes" -ForegroundColor Red

Write-Host ""
Write-Host "💡 SOLUCIÓN:" -ForegroundColor Green
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Abrir las herramientas de desarrollador (F12) → Console" -ForegroundColor White
Write-Host "3. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "4. Verificar que aparezca: '✅ SSE conectado exitosamente - Conexión ÚNICA estable'" -ForegroundColor White
Write-Host "5. Verificar que NO aparezcan reconexiones constantes" -ForegroundColor White
Write-Host "6. ENVIAR MENSAJE DESDE WHATSAPP" -ForegroundColor Green
Write-Host "7. Verificar que el servidor muestre: '📤 Enviando mensaje SSE a 1 clientes'" -ForegroundColor White

Write-Host ""
Write-Host "Diagnóstico completado." -ForegroundColor Green

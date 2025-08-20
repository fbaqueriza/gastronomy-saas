# Script de Prueba - Sistema como WhatsApp Real
# Fecha: 14/08/2025 18:21

Write-Host "Probando sistema como WhatsApp real..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    exit 1
}

# PASO 2: Verificar buffer
Write-Host "Verificando buffer de mensajes..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sync-buffer" -Method POST -TimeoutSec 5
    Write-Host "Buffer funcionando: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error verificando buffer" -ForegroundColor Red
}

# PASO 3: Verificar sincronización forzada
Write-Host "Verificando sincronizacion forzada..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/force-sync" -Method POST -TimeoutSec 5
    Write-Host "Sincronizacion: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error verificando sincronizacion" -ForegroundColor Red
}

# PASO 4: Instrucciones para probar como WhatsApp real
Write-Host ""
Write-Host "Para probar como WhatsApp real:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "3. Esperar que aparezca 'SSE conectado exitosamente'" -ForegroundColor White
Write-Host "4. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "5. El mensaje debe aparecer instantaneamente" -ForegroundColor White
Write-Host "6. Si cierras y abres el chat, los mensajes se sincronizan automaticamente" -ForegroundColor White

Write-Host ""
Write-Host "Caracteristicas implementadas:" -ForegroundColor Green
Write-Host "- Buffer de 20 mensajes (como WhatsApp)" -ForegroundColor White
Write-Host "- Sincronizacion automatica cada 30 segundos" -ForegroundColor White
Write-Host "- Reconexion automatica con mensajes del buffer" -ForegroundColor White
Write-Host "- Envio inmediato cuando hay clientes conectados" -ForegroundColor White

Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Green

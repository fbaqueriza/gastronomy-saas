# Script para forzar conexión SSE y limpiar mensajes
Write-Host "🔧 FORZANDO CONEXIÓN SSE..." -ForegroundColor Green

# 1. Verificar estado actual
Write-Host "📊 Verificando estado actual..." -ForegroundColor Yellow
try {
    $sseStatus = Invoke-WebRequest -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET
    $statusData = $sseStatus.Content | ConvertFrom-Json
    Write-Host "📊 Clientes activos: $($statusData.status.totalActiveClients)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error verificando estado SSE" -ForegroundColor Red
}

# 2. Probar conexión SSE
Write-Host "🔌 Probando conexión SSE..." -ForegroundColor Yellow
try {
    $sseResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/whatsapp/sse" -Method GET
    Write-Host "✅ SSE responde correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en conexión SSE" -ForegroundColor Red
}

# 3. Verificar configuración
Write-Host "📱 Verificando configuración..." -ForegroundColor Yellow
try {
    $configResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/whatsapp/config" -Method GET
    $configData = $configResponse.Content | ConvertFrom-Json
    Write-Host "📊 Modo: $($configData.config.mode)" -ForegroundColor Cyan
    Write-Host "📊 Estado: $($configData.config.status)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error verificando configuración" -ForegroundColor Red
}

Write-Host "✅ Verificación completada" -ForegroundColor Green
Write-Host "🔄 Ahora ejecuta el script de limpieza en el navegador" -ForegroundColor Yellow 
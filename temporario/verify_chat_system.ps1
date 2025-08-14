# Script de Verificación del Sistema de Chat WhatsApp
# Fecha: 14/08/2025 18:16

Write-Host "Verificando sistema de chat..." -ForegroundColor Yellow

# PASO 1: Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
    
    if ($response.clientCount -eq 0) {
        Write-Host "No hay clientes SSE conectados" -ForegroundColor Yellow
    } else {
        Write-Host "Clientes SSE conectados" -ForegroundColor Green
    }
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    exit 1
}

# PASO 2: Verificar buffer de mensajes
Write-Host "Verificando buffer de mensajes..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sync-buffer" -Method POST -TimeoutSec 5
    Write-Host "Buffer funcionando: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error verificando buffer" -ForegroundColor Red
}

# PASO 3: Verificar webhook
Write-Host "Verificando configuracion de webhook..." -ForegroundColor Cyan
$envContent = Get-Content "env.local" -Raw
if ($envContent -match "WHATSAPP_WEBHOOK_URL.*ngrok") {
    Write-Host "Webhook configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "Verificar configuracion de webhook en env.local" -ForegroundColor Yellow
}

# PASO 4: Instrucciones de prueba
Write-Host ""
Write-Host "Para probar el sistema:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "3. Verificar que aparece SSE conectado exitosamente" -ForegroundColor White
Write-Host "4. Enviar mensaje desde WhatsApp" -ForegroundColor White
Write-Host "5. Verificar que el mensaje aparece instantaneamente" -ForegroundColor White

Write-Host ""
Write-Host "Verificacion completada." -ForegroundColor Green

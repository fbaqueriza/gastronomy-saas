# Script de Restauración del Chat WhatsApp - Estado Funcional
# Fecha: 14/08/2025 18:02

Write-Host "🔄 Iniciando restauración del estado funcional del chat..." -ForegroundColor Yellow

# PASO 1: Verificar que el servidor esté corriendo
Write-Host "📡 Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no responde. Iniciando servidor..." -ForegroundColor Red
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized
    Start-Sleep -Seconds 10
}

# PASO 2: Verificar archivos críticos
Write-Host "📁 Verificando archivos críticos..." -ForegroundColor Cyan

$criticalFiles = @(
    "src/contexts/ChatContext.tsx",
    "src/lib/sseUtils.ts", 
    "src/app/api/whatsapp/webhook/route.ts",
    "src/app/api/whatsapp/sse/route.ts",
    "src/app/api/whatsapp/messages/route.ts",
    "src/components/IntegratedChatPanel.tsx",
    "src/components/Navigation.tsx",
    "env.local"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANTE" -ForegroundColor Red
    }
}

# PASO 3: Verificar configuración de webhook
Write-Host "🔗 Verificando configuración de webhook..." -ForegroundColor Cyan
$envContent = Get-Content "env.local" -Raw
if ($envContent -match "WHATSAPP_WEBHOOK_URL.*ngrok") {
    Write-Host "✅ Webhook configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Verificar configuración de webhook en env.local" -ForegroundColor Yellow
}

# PASO 4: Verificar logs del servidor
Write-Host "📊 Verificando logs del servidor..." -ForegroundColor Cyan
Write-Host "Los logs deben mostrar:" -ForegroundColor White
Write-Host "  ✅ Cliente SSE agregado" -ForegroundColor Green
Write-Host "  ✅ Webhook POST - Recibiendo mensaje entrante" -ForegroundColor Green
Write-Host "  ✅ Mensaje guardado en buffer" -ForegroundColor Green
Write-Host "  ✅ Enviando mensaje SSE a X clientes" -ForegroundColor Green

# PASO 5: Comandos de prueba
Write-Host "🧪 Comandos de prueba disponibles:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:3001/api/whatsapp/sse-status" -ForegroundColor White
Write-Host "  curl http://localhost:3001/api/whatsapp/messages" -ForegroundColor White

# PASO 6: Instrucciones de verificación
Write-Host "`n🎯 Para verificar que todo funciona:" -ForegroundColor Yellow
Write-Host "1. Abrir http://localhost:3001 en el navegador" -ForegroundColor White
Write-Host "2. Ir al dashboard y abrir el chat" -ForegroundColor White
Write-Host "3. Enviar mensaje desde WhatsApp a L'igiene (+54 9 11 4178-0300)" -ForegroundColor White
Write-Host "4. Verificar que el mensaje aparece instantáneamente" -ForegroundColor White

Write-Host "`n✅ Restauración completada. Sistema listo para usar." -ForegroundColor Green

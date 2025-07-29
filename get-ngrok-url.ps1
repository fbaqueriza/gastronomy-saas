# Script para obtener la URL pública de ngrok y configurar webhooks de Twilio
# Ejecutar este script después de iniciar ngrok

Write-Host "🔍 Verificando ngrok en puerto 3001..." -ForegroundColor Yellow

try {
    # Intentar obtener información del túnel de ngrok
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method GET
    
    if ($response.tunnels.Count -gt 0) {
        $publicUrl = $response.tunnels[0].public_url
        Write-Host "✅ URL pública encontrada: $publicUrl" -ForegroundColor Green
        
        Write-Host "`n📋 Configuración para Twilio:" -ForegroundColor Cyan
        Write-Host "Webhook URL: $publicUrl/api/whatsapp/twilio/webhook" -ForegroundColor White
        Write-Host "Status Callback URL: $publicUrl/api/whatsapp/status-callback" -ForegroundColor White
        
        Write-Host "`n🔧 Pasos para configurar en Twilio:" -ForegroundColor Yellow
        Write-Host "1. Ir a https://console.twilio.com/" -ForegroundColor White
        Write-Host "2. Navegar a Messaging > Settings > WhatsApp Sandbox" -ForegroundColor White
        Write-Host "3. Configurar Webhook URL: $publicUrl/api/whatsapp/twilio/webhook" -ForegroundColor White
        Write-Host "4. Configurar Status Callback URL: $publicUrl/api/whatsapp/status-callback" -ForegroundColor White
        Write-Host "5. Guardar configuración" -ForegroundColor White
        
    } else {
        Write-Host "❌ No se encontraron túneles de ngrok" -ForegroundColor Red
        Write-Host "💡 Asegúrate de que ngrok esté ejecutándose en el puerto 3001" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error al obtener información de ngrok: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que ngrok esté ejecutándose y accesible en http://localhost:4040" -ForegroundColor Yellow
} 
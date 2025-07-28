# Script para obtener la URL de ngrok
Write-Host "Verificando URL de ngrok..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    if ($response.tunnels -and $response.tunnels.Count -gt 0) {
        $publicUrl = $response.tunnels[0].public_url
        Write-Host "✅ URL de ngrok encontrada: $publicUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔧 Configuración para Twilio:" -ForegroundColor Yellow
        Write-Host "Webhook URL: $publicUrl/api/whatsapp/twilio/webhook" -ForegroundColor Cyan
        Write-Host "Status Callback URL: $publicUrl/api/whatsapp/status-callback" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Pasos para configurar:" -ForegroundColor Yellow
        Write-Host "1. Ve a: https://console.twilio.com/" -ForegroundColor White
        Write-Host "2. WhatsApp > Sandbox Settings" -ForegroundColor White
        Write-Host "3. Configura las URLs de arriba" -ForegroundColor White
    } else {
        Write-Host "❌ No se encontraron túneles de ngrok" -ForegroundColor Red
        Write-Host "Asegúrate de que ngrok esté corriendo con: ngrok http 3001" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al obtener URL de ngrok: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegúrate de que ngrok esté corriendo con: ngrok http 3001" -ForegroundColor Yellow
} 
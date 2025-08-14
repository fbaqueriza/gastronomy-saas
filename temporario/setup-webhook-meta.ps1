# Script para configurar webhook de Meta WhatsApp
Write-Host "🔧 Configurando webhook de Meta WhatsApp..." -ForegroundColor Yellow

# Variables de entorno necesarias
$WHATSAPP_API_KEY = $env:WHATSAPP_API_KEY
$WHATSAPP_PHONE_NUMBER_ID = $env:WHATSAPP_PHONE_NUMBER_ID
$WHATSAPP_BUSINESS_ACCOUNT_ID = $env:WHATSAPP_BUSINESS_ACCOUNT_ID

if (-not $WHATSAPP_API_KEY -or -not $WHATSAPP_PHONE_NUMBER_ID) {
    Write-Host "❌ Variables de entorno no configuradas" -ForegroundColor Red
    Write-Host "Necesitas configurar:" -ForegroundColor Yellow
    Write-Host "  - WHATSAPP_API_KEY" -ForegroundColor Cyan
    Write-Host "  - WHATSAPP_PHONE_NUMBER_ID" -ForegroundColor Cyan
    Write-Host "  - WHATSAPP_BUSINESS_ACCOUNT_ID" -ForegroundColor Cyan
    exit 1
}

# URL del webhook (usar ngrok para desarrollo local)
$WEBHOOK_URL = "https://tu-ngrok-url.ngrok.io/api/whatsapp/webhook"
$VERIFY_TOKEN = "mi_token_de_verificacion_2024_cilantro"

Write-Host "📋 Configuración:" -ForegroundColor Cyan
Write-Host "  - API Key: $($WHATSAPP_API_KEY.Substring(0, 10))..." -ForegroundColor Gray
Write-Host "  - Phone Number ID: $WHATSAPP_PHONE_NUMBER_ID" -ForegroundColor Gray
Write-Host "  - Business Account ID: $WHATSAPP_BUSINESS_ACCOUNT_ID" -ForegroundColor Gray
Write-Host "  - Webhook URL: $WEBHOOK_URL" -ForegroundColor Gray
Write-Host "  - Verify Token: $VERIFY_TOKEN" -ForegroundColor Gray

Write-Host ""
Write-Host "🔗 Para configurar el webhook en Meta:" -ForegroundColor Yellow
Write-Host "1. Ve a https://developers.facebook.com/apps" -ForegroundColor White
Write-Host "2. Selecciona tu app de WhatsApp Business" -ForegroundColor White
Write-Host "3. Ve a WhatsApp > Configuration" -ForegroundColor White
Write-Host "4. En Webhook, configura:" -ForegroundColor White
Write-Host "   - URL: $WEBHOOK_URL" -ForegroundColor Cyan
Write-Host "   - Verify Token: $VERIFY_TOKEN" -ForegroundColor Cyan
Write-Host "5. Selecciona los campos: messages, message_deliveries" -ForegroundColor White

Write-Host ""
Write-Host "🌐 Para obtener una URL pública (ngrok):" -ForegroundColor Yellow
Write-Host "1. Instala ngrok: https://ngrok.com/download" -ForegroundColor White
Write-Host "2. Ejecuta: ngrok http 3001" -ForegroundColor Cyan
Write-Host "3. Usa la URL HTTPS que te da ngrok" -ForegroundColor White

Write-Host ""
Write-Host "✅ Una vez configurado, los mensajes de Ligiene llegaran en tiempo real" -ForegroundColor Green

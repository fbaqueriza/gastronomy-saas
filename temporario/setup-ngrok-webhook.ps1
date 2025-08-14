# Script para configurar ngrok y webhook de Meta
Write-Host "🌐 Configurando ngrok y webhook de Meta..." -ForegroundColor Yellow

# Verificar si ngrok está instalado
try {
    $ngrokVersion = ngrok version 2>$null
    Write-Host "✅ ngrok encontrado: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok no encontrado" -ForegroundColor Red
    Write-Host "📥 Descarga ngrok desde: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host "🔧 Instala y configura ngrok" -ForegroundColor Cyan
    exit 1
}

# Variables de entorno
$WHATSAPP_API_KEY = $env:WHATSAPP_API_KEY
$WHATSAPP_PHONE_NUMBER_ID = $env:WHATSAPP_PHONE_NUMBER_ID
$VERIFY_TOKEN = "mi_token_de_verificacion_2024_cilantro"

if (-not $WHATSAPP_API_KEY -or -not $WHATSAPP_PHONE_NUMBER_ID) {
    Write-Host "❌ Variables de entorno no configuradas" -ForegroundColor Red
    Write-Host "Configura en .env.local:" -ForegroundColor Yellow
    Write-Host "  WHATSAPP_API_KEY=tu_api_key" -ForegroundColor Cyan
    Write-Host "  WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🚀 PASOS PARA CONFIGURAR WEBHOOK:" -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣ Iniciar ngrok (en una nueva terminal):" -ForegroundColor Yellow
Write-Host "   ngrok http 3001" -ForegroundColor Cyan
Write-Host ""

Write-Host "2️⃣ Copiar la URL HTTPS que te da ngrok" -ForegroundColor Yellow
Write-Host "   Ejemplo: https://abc123.ngrok.io" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣ Configurar webhook en Meta:" -ForegroundColor Yellow
Write-Host "   - Ve a: https://developers.facebook.com/apps" -ForegroundColor Cyan
Write-Host "   - Selecciona tu app de WhatsApp Business" -ForegroundColor Cyan
Write-Host "   - WhatsApp > Configuration > Webhook" -ForegroundColor Cyan
Write-Host "   - URL: https://tu-ngrok-url.ngrok.io/api/whatsapp/webhook" -ForegroundColor Cyan
Write-Host "   - Verify Token: $VERIFY_TOKEN" -ForegroundColor Cyan
Write-Host "   - Campos: messages, message_deliveries" -ForegroundColor Cyan
Write-Host ""

Write-Host "4️⃣ Probar el webhook:" -ForegroundColor Yellow
Write-Host "   - Envía un mensaje desde WhatsApp a tu número de business" -ForegroundColor Cyan
Write-Host "   - Verifica que aparezca en tiempo real en el chat" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Una vez configurado, los mensajes llegaran en tiempo real!" -ForegroundColor Green

# Script de prueba para el inicializador de conversación
Write-Host "🧪 Probando inicializador de conversación..." -ForegroundColor Yellow

# URL del endpoint
$url = "http://localhost:3001/api/whatsapp/trigger-conversation"

# Datos de prueba
$body = @{
    to = "+5491135562673"
    template_name = "inicializador_de_conv"
} | ConvertTo-Json

Write-Host "📤 Enviando request a: $url" -ForegroundColor Cyan
Write-Host "📋 Datos: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
} catch {
    Write-Host "❌ Error en la prueba:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "🎯 Prueba completada. Revisa WhatsApp para verificar el mensaje." -ForegroundColor Yellow

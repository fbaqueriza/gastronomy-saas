# Script para probar el envío de notificaciones de pedidos
Write-Host "🧪 Probando envío de notificaciones de pedidos..." -ForegroundColor Yellow

# URL del endpoint de prueba
$url = "http://localhost:3001/api/whatsapp/test-order-notification"

# Datos de prueba
$testData = @{
    providerId = "ligiene-provider-id"
} | ConvertTo-Json

Write-Host "📤 Enviando notificación de pedido de prueba..." -ForegroundColor Cyan
Write-Host "🏪 Proveedor ID: $($testData | ConvertFrom-Json | Select-Object -ExpandProperty providerId)" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $testData -ContentType "application/json"
    
    Write-Host "✅ Respuesta del servidor:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
} catch {
    Write-Host "❌ Error al enviar notificación:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Respuesta de error:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host "`n🏁 Prueba completada" -ForegroundColor Yellow

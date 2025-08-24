# Script para probar el envío de mensajes de WhatsApp
Write-Host "🧪 Probando envío de mensajes de WhatsApp..." -ForegroundColor Yellow

# URL del endpoint de prueba
$url = "http://localhost:3001/api/whatsapp/test-send"

# Datos de prueba
$testData = @{
    to = "+5491135562673"
    message = "🧪 Mensaje de prueba desde PowerShell - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} | ConvertTo-Json

Write-Host "📤 Enviando mensaje de prueba..." -ForegroundColor Cyan
Write-Host "📱 Número: $($testData | ConvertFrom-Json | Select-Object -ExpandProperty to)" -ForegroundColor Gray
Write-Host "💬 Mensaje: $($testData | ConvertFrom-Json | Select-Object -ExpandProperty message)" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $testData -ContentType "application/json"
    
    Write-Host "✅ Respuesta del servidor:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
} catch {
    Write-Host "❌ Error al enviar mensaje:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Respuesta de error:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host "`n🏁 Prueba completada" -ForegroundColor Yellow

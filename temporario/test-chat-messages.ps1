# Script para probar el envío de mensajes y verificar que aparezcan en el chat
Write-Host "🧪 Probando envío de mensajes al chat..." -ForegroundColor Yellow

# URL del endpoint de envío
$url = "http://localhost:3001/api/whatsapp/send"

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
    Write-Host "❌ Error en la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Respuesta de error:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host "`n🎯 Verificar en el chat de la plataforma si aparece el mensaje" -ForegroundColor Yellow
Write-Host "📋 El mensaje debería aparecer con el proveedor correcto" -ForegroundColor Yellow

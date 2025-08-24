# Test de envío directo
Write-Host "🧪 Test de envío directo..." -ForegroundColor Yellow

try {
    $body = @{
        to = "+5491140494130"
        message = "Test directo - $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/send" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Resultado: $($result.success)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

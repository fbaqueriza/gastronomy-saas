Write-Host "Probando creacion de orden..." -ForegroundColor Yellow

$url = "http://localhost:3001/api/whatsapp/test-order-notification"
$testData = @{
    providerId = "4e0c6eec-dee9-4cea-ad9b-d2476fb30409"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $testData -ContentType "application/json"
    Write-Host "Respuesta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "Verificar en el chat si aparece el mensaje de la orden" -ForegroundColor Yellow

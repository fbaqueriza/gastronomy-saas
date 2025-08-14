$accessToken = "EAASVhHJLvloBPA3wCfvH17AxB2C9eFtthAStrCkHSsvXYmcFbLKrMWnCOyt0f8seFaOZAerB25ZBhr4FtbVQP8nLYUbRzK1rqChmGr1nOTCFZCnxMpHJt4ODVuiz1ZB0RBNqZAF2nv1PSbK6nDq2T4JBSkEZCHYyod0nlQMrZBCfmSzZC3JjlS4xRTGmQcQpMxN10AZDZD"
$phoneNumberId = "670680919470999"

Write-Host "Verificando webhooks existentes..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "https://graph.facebook.com/v18.0/$phoneNumberId/subscribed_apps" -Method GET -Headers @{"Authorization"="Bearer $accessToken"}
    
    Write-Host "Webhooks configurados:" -ForegroundColor Yellow
    $response.data | ForEach-Object {
        Write-Host "URL: $($_.callback_url)" -ForegroundColor Cyan
        Write-Host "Fields: $($_.fields -join ', ')" -ForegroundColor Cyan
        Write-Host "---" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error al verificar webhooks: $($_.Exception.Message)" -ForegroundColor Red
}

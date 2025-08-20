$webhookUrl = "https://ab3390cd06e0.ngrok-free.app/api/whatsapp/webhook"
$accessToken = "EAASVhHJLvloBPA3wCfvH17AxB2C9eFtthAStrCkHSsvXYmcFbLKrMWnCOyt0f8seFaOZAerB25ZBhr4FtbVQP8nLYUbRzK1rqChmGr1nOTCFZCnxMpHJt4ODVuiz1ZB0RBNqZAF2nv1PSbK6nDq2T4JBSkEZCHYyod0nlQMrZBCfmSzZC3JjlS4xRTGmQcQpMxN10AZDZD"
$phoneNumberId = "670680919470999"

Write-Host "Configurando webhook..." -ForegroundColor Green
Write-Host "URL: $webhookUrl" -ForegroundColor Yellow
Write-Host "Token: mi_token_de_verificacion_2024_cilantro" -ForegroundColor Yellow

$body = @{
    access_token = $accessToken
    callback_url = $webhookUrl
    verify_token = "mi_token_de_verificacion_2024_cilantro"
    fields = "messages,message_deliveries,message_reads"
} | ConvertTo-Json

Write-Host "Enviando configuración..." -ForegroundColor Green

$response = Invoke-RestMethod -Uri "https://graph.facebook.com/v18.0/$phoneNumberId/subscribed_apps" -Method POST -Headers @{"Authorization"="Bearer $accessToken"; "Content-Type"="application/json"} -Body $body

Write-Host "Respuesta:" -ForegroundColor Green
$response | ConvertTo-Json

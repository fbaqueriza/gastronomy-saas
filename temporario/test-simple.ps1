Write-Host "DIAGNOSTICO DEL SISTEMA DE CHAT" -ForegroundColor Cyan

# 1. Verificar estado del servidor
Write-Host "1. Verificando estado del servidor..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/status" -Method GET
    Write-Host "Estado del servidor:" -ForegroundColor Green
    $statusResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error conectando al servidor: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Probar envío de mensaje
Write-Host "2. Probando envio de mensaje..." -ForegroundColor Yellow
try {
    $sendBody = @{
        to = "+5491135562673"
        message = "Prueba de diagnostico"
    } | ConvertTo-Json

    $sendResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/send" -Method POST -ContentType "application/json" -Body $sendBody
    Write-Host "Mensaje enviado exitosamente:" -ForegroundColor Green
    $sendResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error enviando mensaje: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error body: $errorBody" -ForegroundColor Red
    }
}

Write-Host "Diagnostico completado" -ForegroundColor Cyan 
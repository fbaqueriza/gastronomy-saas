# Script Simple Final
Write-Host "Probando sistema final..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando - Clientes SSE: $($response.clientCount)" -ForegroundColor Green
    
    if ($response.clientCount -gt 0) {
        Write-Host "✅ ¡CLIENTE SSE CONECTADO!" -ForegroundColor Green
        Write-Host "¡AHORA PRUEBA ENVIANDO UN MENSAJE DESDE WHATSAPP!" -ForegroundColor Green
    } else {
        Write-Host "❌ No hay clientes SSE conectados" -ForegroundColor Red
        Write-Host "Abre http://localhost:3001 en el navegador y abre el chat" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

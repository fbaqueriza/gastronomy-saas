# Script para verificar estado SSE
Write-Host "Verificando estado SSE..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET -TimeoutSec 5
    Write-Host "Servidor funcionando" -ForegroundColor Green
    Write-Host "Clientes SSE conectados: $($response.clientCount)" -ForegroundColor Cyan
    
    if ($response.clientCount -gt 0) {
        Write-Host "✅ Hay clientes SSE conectados" -ForegroundColor Green
    } else {
        Write-Host "❌ No hay clientes SSE conectados" -ForegroundColor Red
    }
} catch {
    Write-Host "Error conectando al servidor: $($_.Exception.Message)" -ForegroundColor Red
}

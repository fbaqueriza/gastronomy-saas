# Test de integración entre órdenes y chat
Write-Host "🧪 Probando integración entre órdenes y chat..." -ForegroundColor Yellow

# 1. Verificar que el servidor esté corriendo
Write-Host "1️⃣ Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health-check" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no disponible. Inicia el servidor primero." -ForegroundColor Red
    exit 1
}

# 2. Verificar endpoint de mensajes
Write-Host "2️⃣ Verificando endpoint de mensajes..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET -TimeoutSec 5
    Write-Host "✅ Endpoint de mensajes funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en endpoint de mensajes" -ForegroundColor Red
}

Write-Host "`n🎯 Prueba completada. Verifica en el navegador:" -ForegroundColor Green
Write-Host "   - Abre http://localhost:3001/orders" -ForegroundColor White
Write-Host "   - Crea una nueva orden" -ForegroundColor White
Write-Host "   - Verifica que aparezca en el chat" -ForegroundColor White

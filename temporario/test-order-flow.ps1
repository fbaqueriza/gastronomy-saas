# Test del flujo completo de órdenes
Write-Host "🧪 Test del flujo completo de órdenes..." -ForegroundColor Yellow

# 1. Verificar mensajes antes
Write-Host "1️⃣ Mensajes antes del test:" -ForegroundColor Cyan
try {
    $messagesBefore = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET
    Write-Host "✅ Mensajes antes: $($messagesBefore.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error obteniendo mensajes" -ForegroundColor Red
}

# 2. Simular trigger de conversación
Write-Host "`n2️⃣ Simulando trigger de conversación..." -ForegroundColor Cyan
try {
    $triggerBody = @{
        to = "+5491140494130"
        template_name = "envio_de_orden"
    } | ConvertTo-Json

    $triggerResult = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/trigger-conversation" -Method POST -Body $triggerBody -ContentType "application/json"
    Write-Host "✅ Trigger resultado: $($triggerResult.success)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error en simulación: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Esperar y verificar mensajes después
Write-Host "`n3️⃣ Esperando 3 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "4️⃣ Verificando mensajes después:" -ForegroundColor Cyan
try {
    $messagesAfter = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET
    Write-Host "✅ Mensajes después: $($messagesAfter.count)" -ForegroundColor Green
    
    if ($messagesAfter.count -gt $messagesBefore.count) {
        Write-Host "🎉 ¡Nuevo mensaje agregado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se agregaron nuevos mensajes" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error verificando mensajes" -ForegroundColor Red
}

Write-Host "`n🎯 Instrucciones:" -ForegroundColor Green
Write-Host "   1. Abre http://localhost:3001/orders" -ForegroundColor White
Write-Host "   2. Crea una nueva orden" -ForegroundColor White
Write-Host "   3. Verifica que aparezca en el chat" -ForegroundColor White

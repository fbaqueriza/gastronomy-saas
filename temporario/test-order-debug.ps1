# Test de debug para órdenes y chat
Write-Host "🧪 Test de debug para órdenes y chat..." -ForegroundColor Yellow

# 1. Verificar mensajes actuales
Write-Host "1️⃣ Mensajes actuales en BD:" -ForegroundColor Cyan
try {
    $messages = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET
    Write-Host "✅ Total mensajes: $($messages.count)" -ForegroundColor Green
    
    # Mostrar contactos únicos
    $contacts = $messages.messages | ForEach-Object { $_.contact_id } | Sort-Object -Unique
    Write-Host "📱 Contactos únicos: $($contacts -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "❌ Error obteniendo mensajes" -ForegroundColor Red
}

# 2. Simular envío de orden
Write-Host "`n2️⃣ Simulando envío de orden..." -ForegroundColor Cyan
try {
    $body = @{
        to = "+5491140494130"
        template_name = "envio_de_orden"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/trigger-conversation" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Trigger enviado: $($result.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error enviando trigger" -ForegroundColor Red
}

# 3. Esperar y verificar mensajes actualizados
Write-Host "`n3️⃣ Esperando 3 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "4️⃣ Verificando mensajes actualizados:" -ForegroundColor Cyan
try {
    $messagesUpdated = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET
    Write-Host "✅ Total mensajes actualizados: $($messagesUpdated.count)" -ForegroundColor Green
    
    # Mostrar últimos 3 mensajes
    $lastMessages = $messagesUpdated.messages | Sort-Object timestamp -Descending | Select-Object -First 3
    Write-Host "📨 Últimos 3 mensajes:" -ForegroundColor Green
    $lastMessages | ForEach-Object {
        Write-Host "   - $($_.contact_id): $($_.content.Substring(0, [Math]::Min(50, $_.content.Length)))..." -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error obteniendo mensajes actualizados" -ForegroundColor Red
}

Write-Host "`n🎯 Instrucciones:" -ForegroundColor Green
Write-Host "   1. Abre http://localhost:3001/orders en el navegador" -ForegroundColor White
Write-Host "   2. Abre las herramientas de desarrollador (F12)" -ForegroundColor White
Write-Host "   3. Ve a la pestaña Console" -ForegroundColor White
Write-Host "   4. Crea una nueva orden" -ForegroundColor White
Write-Host "   5. Revisa los logs en la consola" -ForegroundColor White

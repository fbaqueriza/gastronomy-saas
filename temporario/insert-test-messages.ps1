Write-Host "🔧 Insertando mensajes de prueba para L'igiene..." -ForegroundColor Yellow

$apiUrl = "http://localhost:3001/api/whatsapp/messages"

$testMessages = @(
    @{
        contact_id = "+5491135562673"
        content = "Hola, ¿tienen disponible el producto de limpieza que pedimos?"
        message_type = "received"
        status = "delivered"
        timestamp = (Get-Date).AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    },
    @{
        contact_id = "+5491135562673"
        content = "Sí, tenemos stock disponible. ¿Cuántas unidades necesitan?"
        message_type = "sent"
        status = "delivered"
        timestamp = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    },
    @{
        contact_id = "+5491135562673"
        content = "Necesitamos 10 unidades para mañana"
        message_type = "received"
        status = "delivered"
        timestamp = (Get-Date).AddMinutes(-30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    },
    @{
        contact_id = "+5491135562673"
        content = "Perfecto, lo preparamos para mañana. ¿A qué hora lo pasan a buscar?"
        message_type = "sent"
        status = "delivered"
        timestamp = (Get-Date).AddMinutes(-15).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
)

foreach ($message in $testMessages) {
    try {
        $body = $message | ConvertTo-Json -Depth 10
        Write-Host "📤 Enviando mensaje: $($message.content)" -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Mensaje insertado correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error insertando mensaje: $($response.error)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error en la petición: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 Proceso completado. Verificando mensajes..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method GET
    if ($response.success) {
        Write-Host "📊 Total de mensajes en la base de datos: $($response.messageCount)" -ForegroundColor Green
        Write-Host "📋 Mensajes:" -ForegroundColor Cyan
        foreach ($msg in $response.messages) {
            Write-Host "  - $($msg.content) ($($msg.message_type))" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Error obteniendo mensajes: $($response.error)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error verificando mensajes: $($_.Exception.Message)" -ForegroundColor Red
}

# Script para verificar mensajes en la base de datos
Write-Host "🔍 Verificando mensajes en la base de datos..." -ForegroundColor Yellow

# URL del endpoint de mensajes
$url = "http://localhost:3001/api/whatsapp/messages"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "✅ Respuesta del servidor:" -ForegroundColor Green
    Write-Host "📊 Total de mensajes: $($response.count)" -ForegroundColor Cyan
    
    # Mostrar los últimos 10 mensajes
    Write-Host "`n📋 Últimos 10 mensajes:" -ForegroundColor Yellow
    $response.messages | Select-Object -Last 10 | ForEach-Object {
        $msg = $_
        Write-Host "📨 ID: $($msg.id)" -ForegroundColor White
        Write-Host "   📱 Contact: $($msg.contact_id)" -ForegroundColor Gray
        Write-Host "   📝 Content: $($msg.content.Substring(0, [Math]::Min(50, $msg.content.Length)))..." -ForegroundColor Gray
        Write-Host "   🏷️ Type: $($msg.message_type)" -ForegroundColor Gray
        Write-Host "   📅 Timestamp: $($msg.timestamp)" -ForegroundColor Gray
        Write-Host "   📊 Status: $($msg.status)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Buscar mensajes que contengan "NUEVO PEDIDO"
    Write-Host "🔍 Buscando mensajes de órdenes..." -ForegroundColor Yellow
    $orderMessages = $response.messages | Where-Object { $_.content -like "*NUEVO PEDIDO*" }
    
    if ($orderMessages) {
        Write-Host "✅ Encontrados $($orderMessages.Count) mensajes de órdenes:" -ForegroundColor Green
        $orderMessages | ForEach-Object {
            $msg = $_
            Write-Host "📦 Orden - ID: $($msg.id)" -ForegroundColor White
            Write-Host "   📱 Contact: $($msg.contact_id)" -ForegroundColor Gray
            Write-Host "   📅 Timestamp: $($msg.timestamp)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "❌ No se encontraron mensajes de órdenes" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📋 Respuesta de error:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host "`n🎯 Verificar en el chat si aparecen los mensajes de órdenes" -ForegroundColor Yellow

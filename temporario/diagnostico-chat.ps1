Write-Host "🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE CHAT" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

# 1. Verificar estado del servidor
Write-Host "`n📡 1. Verificando estado del servidor..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/status" -Method GET
    Write-Host "✅ Estado del servidor:" -ForegroundColor Green
    $statusResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error conectando al servidor: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Verificar configuración de Twilio
Write-Host "`n📱 2. Verificando configuración de Twilio..." -ForegroundColor Yellow
try {
    $configResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/config" -Method GET
    Write-Host "✅ Configuración de Twilio:" -ForegroundColor Green
    $configResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error obteniendo configuración: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Probar envío de mensaje
Write-Host "`n📤 3. Probando envío de mensaje..." -ForegroundColor Yellow
try {
    $sendBody = @{
        to = "+5491135562673"
        message = "Prueba de diagnóstico automático"
    } | ConvertTo-Json

    $sendResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/send" -Method POST -ContentType "application/json" -Body $sendBody
    Write-Host "✅ Mensaje enviado exitosamente:" -ForegroundColor Green
    $sendResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error enviando mensaje: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error body: $errorBody" -ForegroundColor Red
    }
}

# 4. Verificar mensajes guardados
Write-Host "`n💾 4. Verificando mensajes guardados..." -ForegroundColor Yellow
try {
    $messagesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET
    Write-Host "✅ Mensajes guardados:" -ForegroundColor Green
    $messagesResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error obteniendo mensajes: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Probar SSE
Write-Host "`n🔌 5. Probando conexión SSE..." -ForegroundColor Yellow
try {
    $sseResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/sse-status" -Method GET
    Write-Host "✅ Estado SSE:" -ForegroundColor Green
    $sseResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error SSE: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Verificar variables de entorno
Write-Host "`n🔧 6. Verificando variables de entorno..." -ForegroundColor Yellow
$envVars = @(
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN", 
    "TWILIO_PHONE_NUMBER",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

foreach ($varName in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($varName)
    if ($value) {
        if ($varName -like "*TOKEN*" -or $varName -like "*KEY*") {
            $displayValue = $value.Substring(0, [Math]::Min(10, $value.Length)) + "..."
        } else {
            $displayValue = $value
        }
        Write-Host "✅ $varName`: $displayValue" -ForegroundColor Green
    } else {
        Write-Host "❌ $varName`: NO CONFIGURADA" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Diagnóstico completado" -ForegroundColor Cyan 
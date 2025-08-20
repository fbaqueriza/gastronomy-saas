Write-Host "🔍 Diagnóstico de autenticación y proveedores" -ForegroundColor Green

Write-Host "`n1. Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -UseBasicParsing
    Write-Host "✅ Servidor funcionando (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no responde: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Verificando API de mensajes..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/whatsapp/messages" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ API de mensajes funcionando" -ForegroundColor Green
    Write-Host "   - Mensajes totales: $($data.messages.Count)" -ForegroundColor Cyan
    Write-Host "   - Success: $($data.success)" -ForegroundColor Cyan
    
    $ligieneMessages = $data.messages | Where-Object { $_.contact_id -eq "5491135562673" }
    Write-Host "   - Mensajes de L'igiene: $($ligieneMessages.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en API de mensajes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Verificando API de proveedores..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/providers" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ API de proveedores funcionando" -ForegroundColor Green
    Write-Host "   - Proveedores totales: $($data.providers.Count)" -ForegroundColor Cyan
    
    $ligiene = $data.providers | Where-Object { $_.name -eq "L'igiene" }
    if ($ligiene) {
        Write-Host "   - L'igiene encontrado: $($ligiene.phone)" -ForegroundColor Green
    } else {
        Write-Host "   - L'igiene NO encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API de proveedores requiere autenticación (401)" -ForegroundColor Yellow
    Write-Host "   - Necesitas autenticarte para ver los proveedores" -ForegroundColor Cyan
}

Write-Host "`n📋 Resumen:" -ForegroundColor Green
Write-Host "1. Si ves 'API de proveedores requiere autenticación', necesitas autenticarte" -ForegroundColor White
Write-Host "2. Si hay mensajes de L'igiene pero no aparecen en el chat, es problema de UI" -ForegroundColor White
Write-Host "3. Si no hay mensajes de L'igiene, el problema está en la base de datos" -ForegroundColor White

Write-Host "`n🎯 Próximos pasos:" -ForegroundColor Green
Write-Host "1. Autentícate en la aplicación" -ForegroundColor White
Write-Host "2. Abre el chat y verifica que aparezcan los proveedores" -ForegroundColor White
Write-Host "3. Selecciona L'igiene y verifica que aparezcan los mensajes" -ForegroundColor White

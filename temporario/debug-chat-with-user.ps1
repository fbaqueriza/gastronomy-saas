Write-Host "DEBUG DEL CHAT CON USUARIO - CAPTURA AUTOMATICA" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Gray

# Email de usuario para probar (usar el que tenga proveedores)
$testUserEmail = "test@test.com"

Write-Host "Probando con usuario: $testUserEmail" -ForegroundColor Yellow

# Crear archivo de reporte
$reportFile = "temporario\chat-debug-user-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

$report = @"
=== REPORTE DE DEBUG DEL CHAT CON USUARIO ===
Fecha: $(Get-Date)
Usuario: $testUserEmail

"@

# Test 1: Verificar servidor
Write-Host "Probando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "Servidor corriendo en puerto 3001" -ForegroundColor Green
    $report += "Servidor: OK`n"
} catch {
    Write-Host "Servidor no responde" -ForegroundColor Red
    $report += "Servidor: Error - $($_.Exception.Message)`n"
}

# Test 2: API /api/providers con userEmail
Write-Host "Probando API /api/providers con userEmail..." -ForegroundColor Yellow
try {
    $providersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/providers?userEmail=$testUserEmail" -Method GET -TimeoutSec 5
    $providersData = $providersResponse.Content | ConvertFrom-Json
    Write-Host "API /api/providers: $($providersData.providers.Count) proveedores" -ForegroundColor Green
    $report += "API /api/providers: $($providersData.providers.Count) proveedores`n"
    $report += "Data: $($providersResponse.Content)`n"
} catch {
    Write-Host "Error en API /api/providers" -ForegroundColor Red
    $report += "API /api/providers: Error - $($_.Exception.Message)`n"
}

# Test 3: API /api/data/providers con userEmail
Write-Host "Probando API /api/data/providers con userEmail..." -ForegroundColor Yellow
try {
    $dataProvidersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/data/providers?userEmail=$testUserEmail" -Method GET -TimeoutSec 5
    $dataProvidersData = $dataProvidersResponse.Content | ConvertFrom-Json
    Write-Host "API /api/data/providers: $($dataProvidersData.providers.Count) proveedores" -ForegroundColor Green
    $report += "API /api/data/providers: $($dataProvidersData.providers.Count) proveedores`n"
    $report += "Data: $($dataProvidersResponse.Content)`n"
} catch {
    Write-Host "Error en API /api/data/providers" -ForegroundColor Red
    $report += "API /api/data/providers: Error - $($_.Exception.Message)`n"
}

# Test 4: Verificar si hay usuarios en la base de datos
Write-Host "Probando tabla users..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/users" -Method GET -TimeoutSec 5
    $usersData = $usersResponse.Content | ConvertFrom-Json
    Write-Host "Tabla users: $($usersData.users.Count) usuarios" -ForegroundColor Green
    $report += "Tabla users: $($usersData.users.Count) usuarios`n"
    $report += "Users Data: $($usersResponse.Content)`n"
} catch {
    Write-Host "Error en tabla users (puede ser normal si no existe la ruta)" -ForegroundColor Yellow
    $report += "Tabla users: No disponible`n"
}

# Guardar reporte
$report | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "Reporte guardado en: $reportFile" -ForegroundColor Green

# Mostrar resumen
Write-Host "RESUMEN:" -ForegroundColor Cyan
Get-Content $reportFile

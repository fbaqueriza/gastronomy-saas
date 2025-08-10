Write-Host "DEBUG DEL CHAT - CAPTURA AUTOMATICA" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Gray

# Crear archivo de reporte
$reportFile = "temporario\chat-debug-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"

$report = @"
=== REPORTE DE DEBUG DEL CHAT ===
Fecha: $(Get-Date)

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

# Test 2: API /api/providers
Write-Host "Probando API /api/providers..." -ForegroundColor Yellow
try {
    $providersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/providers" -Method GET -TimeoutSec 5
    $providersData = $providersResponse.Content | ConvertFrom-Json
    Write-Host "API /api/providers: $($providersData.providers.Count) proveedores" -ForegroundColor Green
    $report += "API /api/providers: $($providersData.providers.Count) proveedores`n"
    $report += "Data: $($providersResponse.Content)`n"
} catch {
    Write-Host "Error en API /api/providers" -ForegroundColor Red
    $report += "API /api/providers: Error - $($_.Exception.Message)`n"
}

# Test 3: API /api/data/providers
Write-Host "Probando API /api/data/providers..." -ForegroundColor Yellow
try {
    $dataProvidersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/data/providers" -Method GET -TimeoutSec 5
    $dataProvidersData = $dataProvidersResponse.Content | ConvertFrom-Json
    Write-Host "API /api/data/providers: $($dataProvidersData.providers.Count) proveedores" -ForegroundColor Green
    $report += "API /api/data/providers: $($dataProvidersData.providers.Count) proveedores`n"
    $report += "Data: $($dataProvidersResponse.Content)`n"
} catch {
    Write-Host "Error en API /api/data/providers" -ForegroundColor Red
    $report += "API /api/data/providers: Error - $($_.Exception.Message)`n"
}

# Guardar reporte
$report | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "Reporte guardado en: $reportFile" -ForegroundColor Green

# Mostrar resumen
Write-Host "RESUMEN:" -ForegroundColor Cyan
Get-Content $reportFile

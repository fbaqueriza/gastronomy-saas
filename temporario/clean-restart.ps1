# Script para limpiar logs y reiniciar el servidor
Write-Host "🧹 Limpiando y reiniciando servidor..." -ForegroundColor Yellow

# Matar todos los procesos de Node.js
Write-Host "📋 Matando procesos de Node.js..." -ForegroundColor Cyan
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Procesos de Node.js terminados" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No se encontraron procesos de Node.js activos" -ForegroundColor Gray
}

# Esperar un momento
Write-Host "⏳ Esperando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verificar que el puerto 3001 esté libre
Write-Host "🔍 Verificando puerto 3001..." -ForegroundColor Cyan
$portCheck = netstat -ano | findstr :3001
if ($portCheck) {
    Write-Host "❌ Puerto 3001 aún está ocupado" -ForegroundColor Red
    Write-Host "Procesos en puerto 3001:" -ForegroundColor Red
    Write-Host $portCheck -ForegroundColor Red
} else {
    Write-Host "✅ Puerto 3001 está libre" -ForegroundColor Green
}

# Limpiar la consola
Write-Host "🧹 Limpiando consola..." -ForegroundColor Cyan
Clear-Host

# Iniciar el servidor
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host "✅ Servidor iniciado" -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:3001" -ForegroundColor Green
Write-Host "📝 Logs limpios y polling optimizado" -ForegroundColor Green

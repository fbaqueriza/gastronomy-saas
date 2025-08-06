# Script para hacer commit y push a GitHub
Write-Host "🚀 Iniciando proceso de subida a GitHub..." -ForegroundColor Green

# Verificar si estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ No se encontró un repositorio Git. Inicializando..." -ForegroundColor Red
    git init
}

# Agregar todos los archivos
Write-Host "📁 Agregando archivos..." -ForegroundColor Yellow
git add -A

# Verificar el estado
Write-Host "📋 Estado del repositorio:" -ForegroundColor Yellow
git status

# Hacer commit
Write-Host "💾 Haciendo commit..." -ForegroundColor Yellow
git commit -m "Fix: Remove navigation banner from login page and improve real-time message sync"

# Configurar remote si no existe
Write-Host "🔗 Configurando remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/baquf/gastronomy-saas.git

# Hacer push
Write-Host "📤 Subiendo a GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "✅ Proceso completado!" -ForegroundColor Green 
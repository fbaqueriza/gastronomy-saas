# Script detallado para subir a GitHub
Write-Host "🚀 Iniciando proceso de subida a GitHub..." -ForegroundColor Green
Write-Host ""

# Verificar si Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar si estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ No se encontró un repositorio Git. Inicializando..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
}

# Configurar usuario si no está configurado
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName) {
    Write-Host "⚠️ Configurando usuario Git..." -ForegroundColor Yellow
    git config --global user.name "Francisco Baqueriza"
    git config --global user.email "baquf@gmail.com"
    Write-Host "✅ Usuario Git configurado" -ForegroundColor Green
}

# Verificar el estado actual
Write-Host "📋 Estado del repositorio:" -ForegroundColor Yellow
git status

# Agregar todos los archivos
Write-Host "📁 Agregando archivos..." -ForegroundColor Yellow
git add -A

# Verificar qué archivos se agregaron
Write-Host "📋 Archivos agregados:" -ForegroundColor Yellow
git status --porcelain

# Hacer commit
Write-Host "💾 Haciendo commit..." -ForegroundColor Yellow
git commit -m "Fix: Remove navigation banner from login page and improve real-time message sync"

# Verificar el commit
Write-Host "📋 Último commit:" -ForegroundColor Yellow
git log --oneline -1

# Configurar remote
Write-Host "🔗 Configurando remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/baquf/gastronomy-saas.git

# Verificar remote
Write-Host "📋 Remotes configurados:" -ForegroundColor Yellow
git remote -v

# Hacer push
Write-Host "📤 Subiendo a GitHub..." -ForegroundColor Yellow
git push -u origin main

# Verificar el resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ¡Subida exitosa a GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Error al subir a GitHub. Código de salida: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Resumen de cambios:" -ForegroundColor Cyan
Write-Host "- Navegación condicional (sin banner en login)" -ForegroundColor White
Write-Host "- Sincronización en tiempo real con SSE" -ForegroundColor White
Write-Host "- Respuesta automática desactivada" -ForegroundColor White
Write-Host "- Descripción de plataforma en login" -ForegroundColor White

Write-Host ""
Write-Host "✅ Proceso completado!" -ForegroundColor Green 
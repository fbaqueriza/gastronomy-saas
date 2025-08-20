# Script de inicio seguro para el servidor de desarrollo
# Previene bloqueos del sistema ejecutando limpieza automatica

Write-Host "Iniciando servidor de desarrollo de forma segura..." -ForegroundColor Green

# Funcion para ejecutar limpieza
function Invoke-Cleanup {
    Write-Host "Ejecutando limpieza preventiva..." -ForegroundColor Yellow
    try {
        & "$PSScriptRoot\cleanup-processes.ps1"
        Write-Host "Limpieza completada" -ForegroundColor Green
    }
    catch {
        Write-Host "Error en la limpieza: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Continuando sin limpieza..." -ForegroundColor Yellow
    }
}

# Funcion para verificar si el directorio es valido
function Test-ProjectDirectory {
    if (-not (Test-Path "package.json")) {
        Write-Host "Error: No se encontro package.json en el directorio actual" -ForegroundColor Red
        Write-Host "Asegurate de estar en el directorio raiz del proyecto" -ForegroundColor Yellow
        exit 1
    }
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "No se encontro node_modules. Instalando dependencias..." -ForegroundColor Yellow
        npm install
    }
}

# Funcion para iniciar el servidor de forma segura
function Start-DevServer {
    Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green
    
    try {
        # Iniciar el servidor con manejo de errores
        npm run dev
    }
    catch {
        Write-Host "Error iniciando el servidor: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Intentando reiniciar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        npm run dev
    }
}

# Funcion para manejar la terminacion del script
function Stop-DevServer {
    Write-Host "`nDeteniendo servidor..." -ForegroundColor Yellow
    try {
        # Terminar procesos Node.js del proyecto actual
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*next*" -or $_.CommandLine -like "*gastronomy-saas*"
        } | Stop-Process -Force
        Write-Host "Servidor detenido" -ForegroundColor Green
    }
    catch {
        Write-Host "Error deteniendo servidor: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Configurar manejo de interrupciones
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Stop-DevServer
}

# Configurar Ctrl+C
$null = Register-EngineEvent ([Console]::CancelKeyPress) -Action {
    Stop-DevServer
    exit 0
}

# Ejecutar secuencia de inicio seguro
Write-Host "Verificando entorno..." -ForegroundColor Cyan
Test-ProjectDirectory

Write-Host "Ejecutando limpieza preventiva..." -ForegroundColor Yellow
Invoke-Cleanup

Write-Host "Iniciando servidor..." -ForegroundColor Green
Start-DevServer

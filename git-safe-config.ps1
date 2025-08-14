# Script de configuracion segura para Git
# Previene bloqueos y optimiza el rendimiento

Write-Host "Configurando Git de forma segura..." -ForegroundColor Green

# Funcion para configurar Git con parametros seguros
function Set-GitSafeConfig {
    Write-Host "Aplicando configuraciones seguras de Git..." -ForegroundColor Cyan
    
    try {
        # Configurar Git para evitar bloqueos
        git config --global core.autocrlf true
        git config --global core.safecrlf warn
        git config --global core.fileMode false
        
        # Optimizar para repositorios grandes
        git config --global core.compression 9
        git config --global core.packedGitLimit 512m
        git config --global core.packedGitWindowSize 512m
        git config --global pack.deltaCacheSize 2047m
        git config --global pack.packSizeLimit 2047m
        git config --global pack.windowMemory 2047m
        
        # Configurar timeouts para evitar bloqueos
        git config --global http.postBuffer 524288000
        git config --global http.lowSpeedLimit 0
        git config --global http.lowSpeedTime 999999
        
        # Configurar fetch y pull seguros
        git config --global fetch.parallel 0
        git config --global fetch.unshallow true
        
        # Configurar merge seguro
        git config --global merge.ff false
        git config --global pull.rebase false
        
        Write-Host "Configuracion de Git aplicada" -ForegroundColor Green
    }
    catch {
        Write-Host "Error configurando Git: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Funcion para verificar el estado de Git
function Test-GitStatus {
    Write-Host "Verificando estado de Git..." -ForegroundColor Cyan
    
    try {
        # Verificar si es un repositorio Git
        if (-not (Test-Path ".git")) {
            Write-Host "No es un repositorio Git" -ForegroundColor Red
            return $false
        }
        
        # Verificar si hay cambios pendientes
        $status = git status --porcelain
        if ($status) {
            Write-Host "Hay cambios pendientes en el repositorio" -ForegroundColor Yellow
            Write-Host "Cambios pendientes:" -ForegroundColor Cyan
            $status | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-Host "Repositorio limpio" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Host "Error verificando Git: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funcion para limpiar archivos de bloqueo de Git
function Clear-GitLocks {
    Write-Host "Limpiando archivos de bloqueo de Git..." -ForegroundColor Cyan
    
    try {
        $lockFiles = @(
            ".git/index.lock",
            ".git/MERGE_HEAD.lock",
            ".git/refs/heads/*.lock",
            ".git/refs/tags/*.lock"
        )
        
        foreach ($lockFile in $lockFiles) {
            if (Test-Path $lockFile) {
                Write-Host "Eliminando $lockFile" -ForegroundColor Yellow
                Remove-Item $lockFile -Force
            }
        }
        
        Write-Host "Archivos de bloqueo limpiados" -ForegroundColor Green
    }
    catch {
        Write-Host "Error limpiando bloqueos: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Funcion para crear alias utiles
function Set-GitAliases {
    Write-Host "Configurando alias utiles..." -ForegroundColor Cyan
    
    try {
        # Alias para comandos seguros
        git config --global alias.safe-status "status --porcelain"
        git config --global alias.safe-log "log --oneline -10"
        git config --global alias.safe-pull "pull --no-rebase"
        git config --global alias.safe-push "push --force-with-lease"
        
        # Alias para limpieza
        git config --global alias.cleanup "gc --prune=now"
        git config --global alias.sweep "!git branch --merged | grep -v '\\*' | xargs -n 1 git branch -d"
        
        Write-Host "Alias configurados" -ForegroundColor Green
    }
    catch {
        Write-Host "Error configurando alias: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Ejecutar configuracion completa
Write-Host "Iniciando configuracion segura de Git..." -ForegroundColor Green

# 1. Limpiar bloqueos existentes
Clear-GitLocks

# 2. Verificar estado
if (Test-GitStatus) {
    # 3. Aplicar configuraciones seguras
    Set-GitSafeConfig
    
    # 4. Configurar alias
    Set-GitAliases
    
    Write-Host "Configuracion completa de Git aplicada" -ForegroundColor Green
    Write-Host "Ahora puedes usar comandos Git de forma segura" -ForegroundColor Cyan
} else {
    Write-Host "No se pudo completar la configuracion de Git" -ForegroundColor Yellow
}

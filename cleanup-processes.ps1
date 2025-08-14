# Script de limpieza automática de procesos Node.js
# Este script previene el bloqueo del sistema

Write-Host "🧹 Limpiando procesos Node.js..." -ForegroundColor Yellow

# Función para terminar procesos Node.js de forma segura
function Stop-NodeProcesses {
    try {
        # Buscar todos los procesos de Node.js
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            Write-Host "📋 Encontrados $($nodeProcesses.Count) procesos Node.js" -ForegroundColor Cyan
            
            foreach ($process in $nodeProcesses) {
                try {
                    Write-Host "🔄 Terminando proceso Node.js (PID: $($process.Id))..." -ForegroundColor Yellow
                    $process.Kill()
                    Start-Sleep -Milliseconds 100
                }
                catch {
                    Write-Host "❌ Error terminando proceso $($process.Id): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            
            # Verificar que se terminaron
            Start-Sleep -Seconds 2
            $remainingProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
            if ($remainingProcesses) {
                Write-Host "⚠️ Forzando terminación de procesos restantes..." -ForegroundColor Red
                taskkill /F /IM node.exe 2>$null
            }
        } else {
            Write-Host "✅ No se encontraron procesos Node.js" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Error en la limpieza: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Función para verificar puertos en uso
function Check-PortUsage {
    param([int]$Port)
    
    try {
        $connections = netstat -ano | Select-String ":$Port\s"
        if ($connections) {
            Write-Host "⚠️ Puerto $Port está en uso" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "✅ Puerto $Port está libre" -ForegroundColor Green
            return $false
        }
    }
    catch {
        Write-Host "❌ Error verificando puerto $Port" -ForegroundColor Red
        return $false
    }
}

# Función para liberar puerto específico
function Free-Port {
    param([int]$Port)
    
    try {
        $connections = netstat -ano | Select-String ":$Port\s"
        if ($connections) {
            foreach ($connection in $connections) {
                $parts = $connection -split '\s+'
                $processId = $parts[-1]
                if ($processId -match '^\d+$') {
                    Write-Host "🔄 Terminando proceso que usa puerto $Port (PID: $processId)..." -ForegroundColor Yellow
                    taskkill /F /PID $processId 2>$null
                }
            }
            Start-Sleep -Seconds 1
        }
    }
    catch {
        Write-Host "❌ Error liberando puerto $Port" -ForegroundColor Red
    }
}

# Ejecutar limpieza
Write-Host "🚀 Iniciando limpieza del sistema..." -ForegroundColor Green

# 1. Terminar procesos Node.js
Stop-NodeProcesses

# 2. Verificar y liberar puerto 3001
Write-Host "🔍 Verificando puerto 3001..." -ForegroundColor Cyan
if (Check-PortUsage -Port 3001) {
    Free-Port -Port 3001
}

# 3. Verificar y liberar puerto 3000 (puerto por defecto)
Write-Host "🔍 Verificando puerto 3000..." -ForegroundColor Cyan
if (Check-PortUsage -Port 3000) {
    Free-Port -Port 3000
}

# 4. Limpiar archivos temporales de Node.js
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Cyan
try {
    Remove-Item -Path "$env:TEMP\node*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "$env:TEMP\.npm*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Archivos temporales limpiados" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ No se pudieron limpiar algunos archivos temporales" -ForegroundColor Yellow
}

Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host "🚀 Sistema listo para iniciar" -ForegroundColor Green

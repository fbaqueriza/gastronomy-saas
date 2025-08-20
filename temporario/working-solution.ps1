# Script para ejecutar comandos de forma segura sin trabarse
param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [int]$TimeoutSeconds = 30
)

Write-Host "Ejecutando comando: $Command" -ForegroundColor Green
Write-Host "Timeout: $TimeoutSeconds segundos" -ForegroundColor Yellow

try {
    # Ejecutar comando con timeout
    $job = Start-Job -ScriptBlock { 
        param($cmd)
        Invoke-Expression $cmd
    } -ArgumentList $Command
    
    # Esperar con timeout
    $result = Wait-Job -Job $job -Timeout $TimeoutSeconds
    
    if ($result) {
        # Comando completado
        $output = Receive-Job -Job $job
        Write-Host "Comando completado exitosamente" -ForegroundColor Green
        Write-Host "Salida: $output" -ForegroundColor Cyan
        Remove-Job -Job $job
        exit 0
    } else {
        # Timeout alcanzado
        Write-Host "Timeout alcanzado. Deteniendo proceso..." -ForegroundColor Red
        Stop-Job -Job $job
        Remove-Job -Job $job
        exit 1
    }
} catch {
    Write-Host "Error ejecutando comando: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

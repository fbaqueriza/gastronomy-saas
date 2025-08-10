# Working Solution - Script que funciona definitivamente
param(
    [string]$Command,
    [int]$TimeoutSeconds = 30
)

Write-Host "🔄 Ejecutando comando..." -ForegroundColor Yellow

try {
    # Crear archivo temporal con el comando
    $tempFile = [System.IO.Path]::GetTempFileName()
    $Command | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Ejecutar desde archivo temporal
    $job = Start-Job -ScriptBlock {
        param($file)
        $cmd = Get-Content -Path $file -Raw
        Invoke-Expression $cmd
    } -ArgumentList $tempFile
    
    # Esperar con timeout
    $completed = Wait-Job -Job $job -Timeout $TimeoutSeconds
    
    if ($completed) {
        $output = Receive-Job -Job $job
        Remove-Job -Job $job -Force
        
        Write-Host "✅ Comando completado" -ForegroundColor Green
        
        # Imprimir resultado
        if ($output) {
            Write-Output $output
        }
        
    } else {
        Write-Host "⏰ Timeout" -ForegroundColor Red
        Stop-Job -Job $job -Force
        Remove-Job -Job $job -Force
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Limpiar archivo temporal
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
    
    # Forzar salto de línea final
    Write-Host ""
}

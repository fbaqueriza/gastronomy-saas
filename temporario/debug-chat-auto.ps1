# Script para debug automático del chat
param(
    [string]$Command = "test",
    [int]$TimeoutSeconds = 10
)

Write-Host "🔍 DEBUG AUTOMÁTICO DEL CHAT - $Command" -ForegroundColor Cyan

switch ($Command) {
    "test" {
        Write-Host "🧪 Probando endpoints del chat..." -ForegroundColor Yellow
        
        # Test 1: Verificar que el servidor esté corriendo
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
            Write-Host "✅ Servidor corriendo en puerto 3001" -ForegroundColor Green
        } catch {
            Write-Host "❌ Servidor no responde en puerto 3001" -ForegroundColor Red
            return
        }
        
        # Test 2: Verificar API de providers
        try {
            $providersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/providers" -Method GET -TimeoutSec 5
            $providersData = $providersResponse.Content | ConvertFrom-Json
            Write-Host "📊 API /api/providers: $($providersData.providers.Count) proveedores" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Error en API /api/providers" -ForegroundColor Red
        }
        
        # Test 3: Verificar nueva API de data/providers
        try {
            $dataProvidersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/data/providers" -Method GET -TimeoutSec 5
            $dataProvidersData = $dataProvidersResponse.Content | ConvertFrom-Json
            Write-Host "📊 API /api/data/providers: $($dataProvidersData.providers.Count) proveedores" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Error en API /api/data/providers" -ForegroundColor Red
        }
        
        # Test 4: Verificar SSE
        try {
            $sseResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/whatsapp/sse" -Method GET -TimeoutSec 3
            Write-Host "✅ SSE endpoint responde" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ SSE endpoint no responde (puede ser normal)" -ForegroundColor Yellow
        }
    }
    
    "capture" {
        Write-Host "📸 Capturando estado del chat..." -ForegroundColor Yellow
        
        # Crear archivo de reporte
        $reportFile = "temporario\chat-debug-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
        
        $report = @"
=== REPORTE DE DEBUG DEL CHAT ===
Fecha: $(Get-Date)
Comando: $Command

"@
        
        # Capturar estado de APIs
        try {
            $providersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/providers" -Method GET -TimeoutSec 5
            $providersData = $providersResponse.Content | ConvertFrom-Json
            $report += "`n📊 API /api/providers:`n"
            $report += "Status: $($providersResponse.StatusCode)`n"
            $report += "Providers: $($providersData.providers.Count)`n"
            $report += "Data: $($providersResponse.Content)`n"
        } catch {
            $report += "`n❌ Error en API /api/providers: $($_.Exception.Message)`n"
        }
        
        try {
            $dataProvidersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/data/providers" -Method GET -TimeoutSec 5
            $dataProvidersData = $dataProvidersResponse.Content | ConvertFrom-Json
            $report += "`n📊 API /api/data/providers:`n"
            $report += "Status: $($dataProvidersResponse.StatusCode)`n"
            $report += "Providers: $($dataProvidersData.providers.Count)`n"
            $report += "Data: $($dataProvidersResponse.Content)`n"
        } catch {
            $report += "`n❌ Error en API /api/data/providers: $($_.Exception.Message)`n"
        }
        
        # Guardar reporte
        $report | Out-File -FilePath $reportFile -Encoding UTF8
        Write-Host "📄 Reporte guardado en: $reportFile" -ForegroundColor Green
        
        # Mostrar resumen
        Write-Host "`n📋 RESUMEN:" -ForegroundColor Cyan
        Get-Content $reportFile | Select-Object -First 20
    }
    
    "monitor" {
        Write-Host "👀 Monitoreando chat en tiempo real..." -ForegroundColor Yellow
        Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Gray
        
        $monitorFile = "temporario\chat-monitor-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
        
        while ($true) {
            $timestamp = Get-Date -Format "HH:mm:ss"
            $status = @"
[$timestamp] === MONITOREO DEL CHAT ===
"@
            
            try {
                $providersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/providers" -Method GET -TimeoutSec 3
                $providersData = $providersResponse.Content | ConvertFrom-Json
                $status += "`n📊 Providers: $($providersData.providers.Count)"
            } catch {
                $status += "`n❌ Providers: Error"
            }
            
            try {
                $dataProvidersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/data/providers" -Method GET -TimeoutSec 3
                $dataProvidersData = $dataProvidersResponse.Content | ConvertFrom-Json
                $status += " | Data Providers: $($dataProvidersData.providers.Count)"
            } catch {
                $status += " | Data Providers: Error"
            }
            
            Write-Host $status -ForegroundColor Green
            $status | Out-File -FilePath $monitorFile -Append -Encoding UTF8
            
            Start-Sleep -Seconds 5
        }
    }
    
    default {
        Write-Host "❓ Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host "Comandos disponibles:" -ForegroundColor Yellow
        Write-Host "  test     - Probar endpoints básicos" -ForegroundColor Gray
        Write-Host "  capture  - Capturar estado completo" -ForegroundColor Gray
        Write-Host "  monitor  - Monitoreo en tiempo real" -ForegroundColor Gray
    }
}

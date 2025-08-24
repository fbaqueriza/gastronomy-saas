# Script para probar la normalización de números de teléfono
Write-Host "🧪 Probando normalización de números de teléfono..." -ForegroundColor Yellow

# URL del endpoint de proveedores
$url = "http://localhost:3001/api/providers"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "✅ Proveedores obtenidos:" -ForegroundColor Green
    $response.providers | ForEach-Object {
        $provider = $_
        Write-Host "🏪 Proveedor: $($provider.name)" -ForegroundColor White
        Write-Host "   📱 Teléfono original: $($provider.phone)" -ForegroundColor Gray
        Write-Host "   👤 Contacto: $($provider.contact_name)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Buscar específicamente L'igiene
    $ligiene = $response.providers | Where-Object { $_.name -like "*L'igiene*" -or $_.name -like "*Ligiene*" }
    
    if ($ligiene) {
        Write-Host "🔍 L'igiene encontrado:" -ForegroundColor Yellow
        Write-Host "   📱 Teléfono: $($ligiene.phone)" -ForegroundColor White
        Write-Host "   👤 Contacto: $($ligiene.contact_name)" -ForegroundColor White
        Write-Host "   🆔 ID: $($ligiene.id)" -ForegroundColor White
    } else {
        Write-Host "❌ L'igiene no encontrado" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎯 Verificar si el número +5491135562673 coincide con algún proveedor" -ForegroundColor Yellow

# Script para verificar si un email está registrado en Supabase
Write-Host "🔍 Verificando si el email está registrado en Supabase..." -ForegroundColor Yellow

# Email de prueba
$email = "test@example.com"

Write-Host "📧 Verificando email: $email" -ForegroundColor Cyan

# URL del endpoint
$url = "http://localhost:3001/api/check-user-email"

# Datos de prueba
$body = @{
    email = $email
} | ConvertTo-Json

Write-Host "📤 Enviando request a: $url" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Respuesta:" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
} catch {
    Write-Host "❌ Error en la verificación:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

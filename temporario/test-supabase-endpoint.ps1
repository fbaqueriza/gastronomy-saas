# Script para probar el endpoint de Supabase Auth
Write-Host "🧪 Probando endpoint de Supabase Auth..." -ForegroundColor Yellow

# Email de prueba
$email = "test@example.com"

Write-Host "📧 Probando con email: $email" -ForegroundColor Cyan

# URL del endpoint
$url = "http://localhost:3001/api/test-supabase-auth"

# Datos de prueba
$body = @{
    email = $email
} | ConvertTo-Json

Write-Host "📤 Enviando request a: $url" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
} catch {
    Write-Host "❌ Error en la prueba:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

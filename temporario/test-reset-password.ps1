# Script de prueba para reset password
Write-Host "🧪 Probando función de reset password..." -ForegroundColor Yellow

# Verificar que el servidor esté corriendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor corriendo en puerto 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor no está corriendo en puerto 3001" -ForegroundColor Red
    Write-Host "💡 Ejecuta 'npm run dev' primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Pasos para probar reset password:" -ForegroundColor Cyan
Write-Host "1. Ve a: http://localhost:3001/auth/login" -ForegroundColor White
Write-Host "2. Haz clic en '¿Olvidaste tu contraseña?'" -ForegroundColor White
Write-Host "3. Ingresa tu email" -ForegroundColor White
Write-Host "4. Haz clic en 'Enviar email de recuperación'" -ForegroundColor White
Write-Host "5. Revisa tu email (incluyendo spam)" -ForegroundColor White

Write-Host "🔍 Posibles problemas:" -ForegroundColor Yellow
Write-Host "- Supabase no tiene configurado el envío de emails" -ForegroundColor Red
Write-Host "- El email está en la carpeta de spam" -ForegroundColor Red
Write-Host "- La configuración de Supabase Auth no está habilitada" -ForegroundColor Red

Write-Host "💡 Para verificar la configuración de Supabase:" -ForegroundColor Cyan
Write-Host "1. Ve a: https://jyalmdhyuftjldewbfzw.supabase.co" -ForegroundColor White
Write-Host "2. Authentication Settings Email Templates" -ForegroundColor White
Write-Host "3. Verifica que 'Enable email confirmations' esté habilitado" -ForegroundColor White
Write-Host "4. Verifica que 'Enable email change confirmations' esté habilitado" -ForegroundColor White

Write-Host "🚀 Abriendo página de login..." -ForegroundColor Green
Start-Process "http://localhost:3001/auth/login"

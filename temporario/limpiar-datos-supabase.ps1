# Script para limpiar datos de Supabase
Write-Host "🧹 Limpiando datos de Supabase..." -ForegroundColor Yellow

Write-Host "📋 Pasos para limpiar Supabase:" -ForegroundColor Cyan
Write-Host "1. Ve a: https://jyalmdhyuftjldewbfzw.supabase.co" -ForegroundColor White
Write-Host "2. Authentication > Users" -ForegroundColor White
Write-Host "3. Busca tu email y bórralo" -ForegroundColor White
Write-Host "4. (Opcional) Table Editor > whatsapp_messages > Borra los registros" -ForegroundColor White

Write-Host "📝 Después de limpiar:" -ForegroundColor Cyan
Write-Host "1. Ve a: http://localhost:3001/auth/signup" -ForegroundColor White
Write-Host "2. Regístrate con tu email" -ForegroundColor White
Write-Host "3. Confirma tu email" -ForegroundColor White
Write-Host "4. Prueba reset password en: http://localhost:3001/auth/login" -ForegroundColor White

Write-Host "🚀 ¿Quieres que abra las páginas?" -ForegroundColor Green
$response = Read-Host "Presiona Enter para abrir Supabase Dashboard"

if ($response -eq "") {
    Start-Process "https://jyalmdhyuftjldewbfzw.supabase.co"
    Start-Sleep 2
    Start-Process "http://localhost:3001/auth/signup"
}

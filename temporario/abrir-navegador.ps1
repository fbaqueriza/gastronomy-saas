# Script para abrir navegador y mostrar instrucciones
Write-Host "🌐 ABRIENDO NAVEGADOR..." -ForegroundColor Green

# Abrir navegador en la aplicación
Start-Process "http://localhost:3001"

Write-Host "📋 INSTRUCCIONES PARA ARREGLAR EL CHAT:" -ForegroundColor Yellow
Write-Host "1. Abre la consola del navegador (F12)" -ForegroundColor Cyan
Write-Host "2. Ve a la pestaña 'Console'" -ForegroundColor Cyan
Write-Host "3. Copia y pega el siguiente script:" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== SCRIPT PARA COPIAR ===" -ForegroundColor Green
Get-Content "temporario\limpiar-todo.js"
Write-Host "=== FIN DEL SCRIPT ===" -ForegroundColor Green
Write-Host ""
Write-Host "4. Presiona Enter para ejecutar" -ForegroundColor Cyan
Write-Host "5. Espera a que recargue la página automáticamente" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ El chat debería funcionar correctamente después de la recarga" -ForegroundColor Green 
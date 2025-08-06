@echo off
echo 🚀 Iniciando proceso de subida a GitHub...
echo.

echo 📁 Verificando estado del repositorio...
git status
echo.

echo 📁 Agregando archivos...
git add -A
echo.

echo 💾 Haciendo commit...
git commit -m "Fix: Remove navigation banner from login page and improve real-time message sync"
echo.

echo 🔗 Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/baquf/gastronomy-saas.git
echo.

echo 📤 Subiendo a GitHub...
git push -u origin main
echo.

echo ✅ Proceso completado!
pause 
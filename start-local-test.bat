@echo off
echo 🚀 Iniciando servidor local para pruebas de Meta Cloud API...
echo.

echo 📋 Verificando variables de entorno...
if not exist ".env.local" (
    echo ❌ Error: Archivo .env.local no encontrado
    echo 📝 Crea el archivo .env.local con las variables de Meta Cloud API
    pause
    exit /b 1
)

echo ✅ Variables de entorno encontradas
echo.

echo 🏃 Iniciando servidor de desarrollo...
start "Servidor Local" cmd /k "npm run dev"

echo ⏳ Esperando que el servidor inicie...
timeout /t 5 /nobreak > nul

echo 🧪 Ejecutando pruebas de Meta Cloud API...
node temporario/test-local-meta.js

echo.
echo ✅ Pruebas completadas
echo 📊 Revisa la consola del servidor para ver logs detallados
echo 🌐 Servidor disponible en: http://localhost:3001
echo.
pause 
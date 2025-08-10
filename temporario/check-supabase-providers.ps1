Write-Host "VERIFICANDO PROVEEDORES EN SUPABASE" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Gray

# Variables de entorno de Supabase
$supabaseUrl = "https://jyalmdhyuftjldewbfzw.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YWxtZGh5dWZ0amxkZXdiZnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzOTI0MzMsImV4cCI6MjA2ODk2ODQzM30.2j1QlnNDljonFw1c_kd04MBSR7pNdxRFWioxfHkxokc"

Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow

# Headers para la API de Supabase
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

# Test 1: Verificar tabla users
Write-Host "`n1. Verificando tabla users..." -ForegroundColor Yellow
try {
    $usersUrl = "$supabaseUrl/rest/v1/users?select=*"
    $usersResponse = Invoke-RestMethod -Uri $usersUrl -Headers $headers -Method GET
    Write-Host "Usuarios encontrados: $($usersResponse.Count)" -ForegroundColor Green
    foreach ($user in $usersResponse) {
        Write-Host "  - $($user.email) (ID: $($user.id))" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error obteniendo usuarios: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Verificar tabla providers
Write-Host "`n2. Verificando tabla providers..." -ForegroundColor Yellow
try {
    $providersUrl = "$supabaseUrl/rest/v1/providers?select=*"
    $providersResponse = Invoke-RestMethod -Uri $providersUrl -Headers $headers -Method GET
    Write-Host "Proveedores encontrados: $($providersResponse.Count)" -ForegroundColor Green
    foreach ($provider in $providersResponse) {
        Write-Host "  - $($provider.name) (User: $($provider.user_id))" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error obteniendo proveedores: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Verificar proveedores por usuario específico
Write-Host "`n3. Verificando proveedores por usuario..." -ForegroundColor Yellow
try {
    # Obtener el primer usuario
    $firstUser = $usersResponse[0]
    if ($firstUser) {
        $userProvidersUrl = "$supabaseUrl/rest/v1/providers?select=*&user_id=eq.$($firstUser.id)"
        $userProvidersResponse = Invoke-RestMethod -Uri $userProvidersUrl -Headers $headers -Method GET
        Write-Host "Proveedores para $($firstUser.email): $($userProvidersResponse.Count)" -ForegroundColor Green
        foreach ($provider in $userProvidersResponse) {
            Write-Host "  - $($provider.name)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error obteniendo proveedores por usuario: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nVerificación completada" -ForegroundColor Cyan

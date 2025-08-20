# 🛡️ Sistema de Prevención de Bloqueos

Este conjunto de scripts previene que el sistema se bloquee debido a múltiples procesos Node.js y problemas de Git.

## 📁 Archivos de Prevención

### 1. `cleanup-processes.ps1`
**Función:** Limpia automáticamente todos los procesos Node.js y libera puertos bloqueados.

**Características:**
- ✅ Termina procesos Node.js de forma segura
- ✅ Libera puertos 3000 y 3001 automáticamente
- ✅ Limpia archivos temporales
- ✅ Manejo de errores robusto

### 2. `start-dev-safe.ps1`
**Función:** Inicia el servidor de desarrollo de forma segura con limpieza automática.

**Características:**
- ✅ Ejecuta limpieza antes de iniciar
- ✅ Verifica el entorno del proyecto
- ✅ Maneja interrupciones (Ctrl+C) correctamente
- ✅ Termina procesos automáticamente al salir

### 3. `git-safe-config.ps1`
**Función:** Configura Git para evitar bloqueos y optimizar el rendimiento.

**Características:**
- ✅ Limpia archivos de bloqueo de Git
- ✅ Aplica configuraciones seguras
- ✅ Optimiza para repositorios grandes
- ✅ Crea alias útiles

## 🚀 Cómo Usar

### Inicio Seguro del Servidor
```powershell
# En lugar de: npm run dev
# Usar:
.\start-dev-safe.ps1
```

### Limpieza Manual
```powershell
# Para limpiar procesos manualmente:
.\cleanup-processes.ps1
```

### Configuración de Git
```powershell
# Configurar Git de forma segura:
.\git-safe-config.ps1
```

## 🔧 Configuración Automática

### Alias Útiles (se configuran automáticamente)
```bash
# Ver estado de forma segura
git safe-status

# Ver logs de forma segura
git safe-log

# Pull seguro
git safe-pull

# Push seguro
git safe-push

# Limpiar repositorio
git cleanup

# Limpiar ramas
git sweep
```

## 🛡️ Prevención Automática

### Antes de Iniciar el Servidor
1. **Limpieza automática** de procesos Node.js
2. **Liberación de puertos** bloqueados
3. **Verificación del entorno** del proyecto

### Durante el Desarrollo
1. **Manejo de interrupciones** (Ctrl+C)
2. **Terminación automática** de procesos al salir
3. **Limpieza de archivos temporales**

### Configuración de Git
1. **Limpieza de bloqueos** automática
2. **Optimización de memoria** para repositorios grandes
3. **Timeouts seguros** para evitar bloqueos

## 🚨 Solución de Problemas

### Si el Sistema se Bloquea
1. **Ejecutar limpieza manual:**
   ```powershell
   .\cleanup-processes.ps1
   ```

2. **Si persiste, reiniciar el sistema**

3. **Después del reinicio, ejecutar:**
   ```powershell
   .\git-safe-config.ps1
   .\start-dev-safe.ps1
   ```

### Si Git se Bloquea
1. **Limpiar bloqueos:**
   ```powershell
   .\git-safe-config.ps1
   ```

2. **Usar comandos seguros:**
   ```bash
   git safe-status
   git safe-log
   ```

## 📋 Checklist de Prevención

- [ ] ✅ Scripts de prevención instalados
- [ ] ✅ Git configurado de forma segura
- [ ] ✅ Usar `start-dev-safe.ps1` en lugar de `npm run dev`
- [ ] ✅ Ejecutar limpieza manual si es necesario
- [ ] ✅ Reiniciar sistema si hay bloqueos persistentes

## 🔄 Flujo de Trabajo Recomendado

1. **Iniciar desarrollo:**
   ```powershell
   .\start-dev-safe.ps1
   ```

2. **Hacer cambios en el código**

3. **Usar Git de forma segura:**
   ```bash
   git safe-status
   git add .
   git commit -m "mensaje"
   git safe-push
   ```

4. **Al terminar:** Ctrl+C para detener el servidor (se limpia automáticamente)

## ⚠️ Notas Importantes

- **Nunca ejecutar múltiples instancias** de `npm run dev`
- **Siempre usar** `start-dev-safe.ps1` para desarrollo
- **Ejecutar limpieza** si el sistema se siente lento
- **Reiniciar** si hay bloqueos persistentes

## 🎯 Beneficios

- ✅ **Sin bloqueos** del sistema
- ✅ **Git funcional** siempre
- ✅ **Limpieza automática** de procesos
- ✅ **Inicio seguro** del servidor
- ✅ **Manejo robusto** de errores

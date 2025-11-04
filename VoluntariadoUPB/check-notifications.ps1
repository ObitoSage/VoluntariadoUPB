# 🚀 Script de Inicialización Rápida de Notificaciones

Write-Host "=== INICIALIZACIÓN DEL SISTEMA DE NOTIFICACIONES ===" -ForegroundColor Green
Write-Host ""

# 1. Verificar instalación de paquetes
Write-Host "1️⃣  Verificando dependencias..." -ForegroundColor Cyan
$packageJson = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
$hasExpoNotifications = $packageJson.dependencies."expo-notifications"
$hasExpoDevice = $packageJson.dependencies."expo-device"

if ($hasExpoNotifications -and $hasExpoDevice) {
    Write-Host "   ✅ expo-notifications: $hasExpoNotifications" -ForegroundColor Green
    Write-Host "   ✅ expo-device: $hasExpoDevice" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Instalando dependencias faltantes..." -ForegroundColor Yellow
    yarn add expo-notifications expo-device
}

Write-Host ""

# 2. Verificar Project ID
Write-Host "2️⃣  Verificando Expo Project ID..." -ForegroundColor Cyan
$notificationService = Get-Content -Raw -Path "src\services\notificationService.ts"
if ($notificationService -match "projectId: 'your-project-id'") {
    Write-Host "   ⚠️  Project ID no configurado" -ForegroundColor Yellow
    Write-Host "   📝 Debes actualizar src/services/notificationService.ts línea 56" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Opciones:" -ForegroundColor White
    Write-Host "   A) Obtener de expo.dev → https://expo.dev" -ForegroundColor Gray
    Write-Host "   B) Crear con: npx expo login && eas init" -ForegroundColor Gray
} else {
    Write-Host "   ✅ Project ID configurado" -ForegroundColor Green
}

Write-Host ""

# 3. Verificar app.json
Write-Host "3️⃣  Verificando configuración de app.json..." -ForegroundColor Cyan
$appJson = Get-Content -Raw -Path "app.json" | ConvertFrom-Json
$hasNotificationPermission = $appJson.expo.android.permissions -contains "POST_NOTIFICATIONS"
$hasNotificationPlugin = $appJson.expo.plugins | Where-Object { $_ -is [array] -and $_[0] -eq "expo-notifications" }

if ($hasNotificationPermission -and $hasNotificationPlugin) {
    Write-Host "   ✅ Permisos de Android configurados" -ForegroundColor Green
    Write-Host "   ✅ Plugin expo-notifications configurado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Configuración incompleta en app.json" -ForegroundColor Yellow
}

Write-Host ""

# 4. Estado de Firebase Functions
Write-Host "4️⃣  Verificando Firebase Functions..." -ForegroundColor Cyan
if (Test-Path -Path "..\*\functions\src\index.ts") {
    Write-Host "   ✅ Directorio de functions existe" -ForegroundColor Green
    Write-Host "   💡 Ejecuta: firebase deploy --only functions" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  Firebase Functions no inicializado" -ForegroundColor Yellow
    Write-Host "   📝 Sigue las instrucciones en PASOS_FINALES.md sección 'Firebase Functions Setup'" -ForegroundColor Yellow
}

Write-Host ""

# 5. Resumen de archivos
Write-Host "5️⃣  Archivos del sistema:" -ForegroundColor Cyan
$files = @(
    "src\services\notificationService.ts",
    "src\hooks\useNotifications.ts",
    "app\(drawer)\settings.tsx",
    "FIREBASE_FUNCTIONS_NOTIFICATIONS.ts",
    "README_NOTIFICACIONES.md",
    "GUIA_NOTIFICACIONES.md",
    "PASOS_FINALES.md"
)

foreach ($file in $files) {
    if (Test-Path -Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (faltante)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== ESTADO DEL SISTEMA ===" -ForegroundColor Magenta
Write-Host ""

# Calcular progreso
$total = 5
$completed = 0

if ($hasExpoNotifications -and $hasExpoDevice) { $completed++ }
if ($notificationService -notmatch "projectId: 'your-project-id'") { $completed++ }
if ($hasNotificationPermission -and $hasNotificationPlugin) { $completed++ }
if (Test-Path -Path "src\services\notificationService.ts") { $completed++ }
if (Test-Path -Path "src\hooks\useNotifications.ts") { $completed++ }

$percentage = [math]::Round(($completed / $total) * 100)

Write-Host "Progreso: $completed/$total tareas completadas ($percentage%)" -ForegroundColor Cyan

if ($percentage -eq 100) {
    Write-Host ""
    Write-Host "🎉 ¡SISTEMA COMPLETAMENTE CONFIGURADO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Desplegar Firebase Functions (si no está hecho)" -ForegroundColor White
    Write-Host "2. Ejecutar: npx expo run:android (en dispositivo físico)" -ForegroundColor White
    Write-Host "3. Activar notificaciones en Settings" -ForegroundColor White
    Write-Host "4. Probar cambiando estado de postulación en Firestore" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Configuración incompleta" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Lee PASOS_FINALES.md para completar la configuración" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 Comandos útiles:" -ForegroundColor Magenta
Write-Host "   yarn install              - Instalar dependencias" -ForegroundColor Gray
Write-Host "   npx expo run:android      - Ejecutar en Android" -ForegroundColor Gray
Write-Host "   firebase deploy --only functions  - Desplegar functions" -ForegroundColor Gray
Write-Host "   firebase functions:log    - Ver logs de functions" -ForegroundColor Gray
Write-Host ""

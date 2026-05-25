# Control Activos - Stock App

Aplicación móvil para control de activos desarrollada con React Native, Expo y Supabase.

## Requisitos previos

- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Supabase (gratuita)
- Dispositivo físico con Expo Go o emulador Android/iOS

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/PabloHD2024/Control_Stock_App_Movile.git
cd Control_Stock_App_Movile

# Instalar dependencias

npm install
# o
yarn install

# Configurar Supabase

Crea un proyecto en Supabase

En la sección Project Settings > API, copia:

URL (Project URL)

anon (public) key

Crea un archivo .env en la raíz del proyecto:

# Ejecutar aplicacion:

npx expo start

# Ver en dispositivo

Android/iOS físicos: Escanea el código QR con la app Expo Go

Android emulador: Presiona a

iOS simulator: Presiona i

Web: Presiona w

# Estructura del proyecto

Control-Activos/
├── app/              # Pantallas y navegación (Expo Router)
├── components/       # Componentes reutilizables
├── services/         # Conexión con Supabase
├── hooks/           # Custom hooks
├── utils/           # Funciones auxiliares
└── assets/          # Imágenes, fuentes, etc.

# Variables de entorno necesarias

Variable	Descripción
EXPO_PUBLIC_SUPABASE_URL	URL de tu proyecto Supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY	Clave anónima de Supabase
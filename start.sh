#!/bin/bash

# Script para iniciar el servidor de desarrollo Angular

echo "🔍 Verificando Node.js..."
node --version || { echo "❌ Node.js no está instalado"; exit 1; }

echo "🔍 Verificando npm..."
npm --version || { echo "❌ npm no está instalado"; exit 1; }

echo "🔍 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🚀 Iniciando servidor de desarrollo..."
echo "📍 El servidor estará disponible en: http://localhost:4200"
echo ""

npx ng serve --open









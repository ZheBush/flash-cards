#!/bin/bash

# Script: Запуск тестов фронтенда локально

set -e

echo "🧪 Запуск тестов фронтенда..."
echo ""

# Проверьте, находимся ли в корне проекта
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта"
    exit 1
fi

# Перейдите в папку фронтенда
cd front

# Проверьте наличие зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

echo "🔍 Запуск линтинга (ESLint)..."
npm run lint || true
echo ""

echo "✅ Запуск unit тестов..."
npm run test:unit
echo ""

echo "✨ Тесты завершены!"

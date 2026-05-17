#!/bin/bash

# Script: Запуск всех тестов (бэк + фронт)

set -e

echo "🚀 Запуск полного набора тестов..."
echo ""

# Проверьте, находимся ли в корне проекта
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта"
    exit 1
fi

# Запустите тесты бэкенда
echo "════════════════════════════════════════"
echo "БЭКЕНД ТЕСТЫ"
echo "════════════════════════════════════════"
bash scripts/test-backend.sh || TEST_BACKEND_FAILED=1
echo ""

# Запустите тесты фронтенда
echo "════════════════════════════════════════"
echo "ФРОНТЕНД ТЕСТЫ"
echo "════════════════════════════════════════"
bash scripts/test-frontend.sh || TEST_FRONTEND_FAILED=1
echo ""

# Проверка результатов
echo "════════════════════════════════════════"
echo "РЕЗУЛЬТАТЫ"
echo "════════════════════════════════════════"

if [ -z "$TEST_BACKEND_FAILED" ]; then
    echo "✅ Бэкенд тесты: PASSED"
else
    echo "❌ Бэкенд тесты: FAILED"
fi

if [ -z "$TEST_FRONTEND_FAILED" ]; then
    echo "✅ Фронтенд тесты: PASSED"
else
    echo "❌ Фронтенд тесты: FAILED"
fi

if [ -z "$TEST_BACKEND_FAILED" ] && [ -z "$TEST_FRONTEND_FAILED" ]; then
    echo ""
    echo "✨ ВСЕ ТЕСТЫ ПРОЙДЕНЫ! 🎉"
    exit 0
else
    echo ""
    echo "⚠️  НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ"
    exit 1
fi

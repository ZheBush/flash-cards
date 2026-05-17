#!/bin/bash

# Script: Инициализация проекта для локальной разработки

set -e

echo "🚀 Инициализация проекта для разработки..."
echo ""

# Проверьте, находимся ли в корне проекта
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта"
    exit 1
fi

# 1. Создайте .env файл, если его нет
if [ ! -f ".env" ]; then
    echo "📝 Создание .env файла..."
    cp .env.example .env
    echo "✅ .env создан (используются значения по умолчанию)"
else
    echo "✅ .env файл уже существует"
fi

echo ""

# 2. Проверьте Docker
echo "🐳 Проверка Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    exit 1
fi
echo "✅ Docker установлен"

# 3. Проверьте Docker Compose
echo "🐳 Проверка Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    exit 1
fi
echo "✅ Docker Compose установлен"

echo ""

# 4. Запустите контейнеры
echo "🚀 Запуск контейнеров..."
docker-compose up -d --build

echo ""
echo "⏳ Ожидание инициализации сервисов (30 сек)..."
sleep 30

echo ""
echo "✅ Инициализация завершена!"
echo ""
echo "📍 Приложение доступно по адресам:"
echo "   • Frontend: http://localhost:3001"
echo "   • Backend:  http://localhost:8000"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • MinIO:    http://localhost:9001 (minioadmin:minioadmin)"
echo ""
echo "💡 Полезные команды:"
echo "   docker-compose logs -f          # Посмотреть логи"
echo "   docker-compose down             # Остановить контейнеры"
echo "   docker-compose down -v          # Остановить и удалить данные"
echo "   bash scripts/test-all.sh        # Запустить все тесты"

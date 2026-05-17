#!/bin/bash

# Script: Запуск тестов бэкенда локально

set -e

echo "🧪 Запуск тестов бэкенда..."
echo ""

# Проверьте, находимся ли в корне проекта
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта"
    exit 1
fi

# Проверьте наличие виртуального окружения
if [ ! -d "back/venv" ] && [ ! -d "back/.venv" ]; then
    echo "⚠️  Виртуальное окружение не найдено"
    echo "📦 Установка зависимостей..."
    cd back
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install -r requirements-test.txt
    cd ..
fi

# Активируйте виртуальное окружение
if [ -d "back/venv" ]; then
    source back/venv/bin/activate
elif [ -d "back/.venv" ]; then
    source back/.venv/bin/activate
fi

# Перейдите в папку бэкенда
cd back

echo "🔍 Запуск линтинга (flake8)..."
flake8 app --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics || true
echo ""

echo "✅ Запуск тестов (pytest)..."
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

echo ""
echo "✨ Тесты завершены!"
echo "📊 Отчет о покрытии доступен в: htmlcov/index.html"

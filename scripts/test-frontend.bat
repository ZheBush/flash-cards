@echo off
REM Script: Запуск тестов фронтенда локально (Windows)

echo 🧪 Запуск тестов фронтенда...
echo.

REM Проверьте, находимся ли в корне проекта
if not exist "docker-compose.yml" (
    echo ❌ Ошибка: Запустите скрипт из корня проекта
    exit /b 1
)

REM Перейдите в папку фронтенда
cd front

REM Проверьте наличие зависимостей
if not exist "node_modules" (
    echo 📦 Установка зависимостей...
    call npm install
)

echo 🔍 Запуск линтинга (ESLint)...
call npm run lint
echo.

echo ✅ Запуск unit тестов...
call npm run test:unit
echo.

echo ✨ Тесты завершены!

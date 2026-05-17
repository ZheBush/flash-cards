@echo off
REM Script: Инициализация проекта для локальной разработки (Windows)

echo 🚀 Инициализация проекта для разработки...
echo.

REM Проверьте, находимся ли в корне проекта
if not exist "docker-compose.yml" (
    echo ❌ Ошибка: Запустите скрипт из корня проекта
    exit /b 1
)

REM 1. Создайте .env файл, если его нет
if not exist ".env" (
    echo 📝 Создание .env файла...
    copy .env.example .env
    echo ✅ .env создан (используются значения по умолчанию)
) else (
    echo ✅ .env файл уже существует
)

echo.

REM 2. Проверьте Docker
echo 🐳 Проверка Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker не установлен!
    exit /b 1
)
echo ✅ Docker установлен

REM 3. Проверьте Docker Compose
echo 🐳 Проверка Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose не установлен!
    exit /b 1
)
echo ✅ Docker Compose установлен

echo.

REM 4. Запустите контейнеры
echo 🚀 Запуск контейнеров...
docker-compose up -d --build

echo.
echo ⏳ Ожидание инициализации сервисов (30 сек)...
timeout /t 30 /nobreak

echo.
echo ✅ Инициализация завершена!
echo.
echo 📍 Приложение доступно по адресам:
echo    • Frontend: http://localhost:3001
echo    • Backend:  http://localhost:8000
echo    • API Docs: http://localhost:8000/docs
echo    • MinIO:    http://localhost:9001 ^(minioadmin:minioadmin^)
echo.
echo 💡 Полезные команды:
echo    docker-compose logs -f          # Посмотреть логи
echo    docker-compose down             # Остановить контейнеры
echo    docker-compose down -v          # Остановить и удалить данные

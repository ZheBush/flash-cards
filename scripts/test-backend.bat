@echo off
REM Script: Запуск тестов бэкенда локально (Windows)

echo 🧪 Запуск тестов бэкенда...
echo.

REM Проверьте, находимся ли в корне проекта
if not exist "docker-compose.yml" (
    echo ❌ Ошибка: Запустите скрипт из корня проекта
    exit /b 1
)

REM Перейдите в папку бэкенда
cd back

REM Проверьте наличие виртуального окружения
if not exist "venv" (
    if not exist ".venv" (
        echo ⚠️  Виртуальное окружение не найдено
        echo 📦 Установка зависимостей...
        python -m venv venv
        call venv\Scripts\activate.bat
        pip install -r requirements.txt
        pip install -r requirements-test.txt
        cd ..
        cd back
    )
)

REM Активируйте виртуальное окружение
if exist "venv" (
    call venv\Scripts\activate.bat
) else if exist ".venv" (
    call .venv\Scripts\activate.bat
)

echo 🔍 Запуск линтинга (flake8)...
flake8 app --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
echo.

echo ✅ Запуск тестов (pytest)...
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

echo.
echo ✨ Тесты завершены!
echo 📊 Отчет о покрытии доступен в: htmlcov/index.html

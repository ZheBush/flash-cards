# Настройка и запуск CI/CD в GitHub

## Что нужно сделать чтобы запустить CI/CD?

### 1️⃣ Подготовка репозитория

#### Шаг 1: Инициализируйте Git репозиторий (если нет)

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/flash-cards.git
git branch -M main
```

#### Шаг 2: Добавьте все файлы в репозиторий

```bash
git add .
git commit -m "Initial commit with CI/CD setup"
git push -u origin main
```

### 2️⃣ Проверьте структуру GitHub

Убедитесь, что в репозитории есть:

```
.github/
└── workflows/
    └── ci-cd.yml  ✅ CI/CD конфигурация
```

Если папка `.github/workflows/` не существует - она будет создана автоматически при push.

### 3️⃣ Включите GitHub Actions

1. Откройте репозиторий на GitHub
2. Перейдите в вкладку **Actions**
3. Если CI/CD отключен, нажмите кнопку **"I understand my workflows, go ahead and enable them"**

### 4️⃣ Добавьте GitHub Secrets (для production)

Для развертывания на production, добавьте secrets:

1. Откройте **Settings** → **Secrets and variables** → **Actions**
2. Нажмите **New repository secret**
3. Добавьте следующие secrets:

```
DEPLOY_HOST         # IP или домен вашего сервера
DEPLOY_USER         # SSH пользователь на сервере
DEPLOY_KEY          # SSH приватный ключ
DEPLOY_PATH         # Путь на сервере для развертывания
```

> **Примечание:** Для локальной разработки secrets не требуются

---

## Как запустить CI/CD

### Вариант 1: Автоматический запуск (рекомендуется)

CI/CD запускается **автоматически** при:

1. **Push в main, develop или projects ветки:**
```bash
git push origin main
```

2. **Pull Request в эти ветки:**
```bash
git push origin feature/my-feature
# Создайте Pull Request в GitHub UI
```

### Вариант 2: Ручной запуск

1. Откройте вкладку **Actions** в GitHub
2. Выберите workflow **"CI/CD Pipeline"**
3. Нажмите **"Run workflow"** → **"Run workflow"**

---

## Что делает CI/CD Pipeline?

### 📝 Backend тесты (Python)
- ✅ Установка зависимостей
- ✅ Линтинг кода (flake8)
- ✅ Запуск pytest с coverage
- ✅ Загрузка отчета в Codecov

**Переменные окружения:**
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/text_cards
SECRET_KEY=test-secret-key
S3_BUCKET=test-bucket
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
WEATHER_API_KEY=test-key
```

### 🎨 Frontend тесты (JavaScript/TypeScript)
- ✅ Установка зависимостей
- ✅ Линтинг кода (ESLint)
- ✅ Запуск unit тестов
- ✅ E2E тесты (Playwright)

### 🐳 Сборка Docker образов
- ✅ Сборка backend образа
- ✅ Сборка frontend образа
- ✅ Кеширование слоев для ускорения

### ✔️ Валидация
- ✅ Проверка docker-compose.yml синтаксиса
- ✅ Установка Docker Compose

### 🚀 Развертывание (только main ветка)
- ✅ Развертывание на production (если все проверки пройдены)

---

## Просмотр результатов CI/CD

### В GitHub UI

1. Откройте репозиторий на GitHub
2. Перейдите в вкладку **Actions**
3. Выберите последний workflow run
4. Просмотрите статус каждого job:
   - ✅ **Зелёный статус** - тесты прошли
   - ❌ **Красный статус** - тесты упали

### Детальный просмотр логов

1. Нажмите на job (например, "backend-tests")
2. Посмотрите логи каждого шага
3. Найдите ошибку в логах

---

## Исправление ошибок в CI/CD

### ❌ Backend тесты падают

**Ошибка:** `ModuleNotFoundError: No module named 'aiosqlite'`

**Решение:** Добавьте `aiosqlite>=0.19.0` в `back/requirements-test.txt`

```bash
# back/requirements-test.txt
pytest>=8.0
pytest-asyncio>=0.21
pytest-cov>=4.0
httpx>=0.28
aiosqlite>=0.19.0
```

**Ошибка:** `ImportError: cannot import name 'xxx'`

**Решение:** Проверьте что все зависимости в `requirements.txt` и `requirements-test.txt`

### ❌ Frontend тесты падают

**Ошибка:** `npm ci can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync`

**Решение:** Обновите package-lock.json локально и закоммитьте

```bash
cd front
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

**Ошибка:** `npm run lint not found`

**Решение:** Убедитесь что скрипт `lint` есть в `front/package.json`

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  }
}
```

### ❌ Docker Compose валидация падает

**Ошибка:** `docker-compose: command not found`

**Решение:** Docker Compose установится автоматически в workflow. Если не помогает, переустановите Docker Compose локально.

### ❌ Tests timeout

**Ошибка:** `Test timeout after X seconds`

**Решение:** Увеличьте timeout в workflow или оптимизируйте тесты

```yaml
- name: Run tests with timeout
  run: |
    cd back
    timeout 300 pytest tests/ -v
```

---

## Кэширование зависимостей

GitHub Actions автоматически кеширует зависимости для ускорения:

- **Python зависимости** - кешируются в `~/.cache/pip`
- **Node зависимости** - кешируются в `~/.npm`
- **Docker слои** - кешируются в GitHub Container Registry

Это уменьшает время выполнения workflow с нескольких минут до ~30 секунд.

---

## Ветвления и triggers

### Когда запускается CI/CD?

- ✅ При push в `main`, `develop` или `projects`
- ✅ При pull request в `main`, `develop` или `projects`

### Только development ветки

Если хотите тестировать только на `develop`:

```yaml
on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ develop ]
```

### Только на schedule (по расписанию)

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Каждый день в полночь UTC
```

---

## Развертывание на production

### Требования

1. **SSH доступ к серверу**
2. **Docker и Docker Compose на сервере**
3. **GitHub Secrets настроены**

### Как это работает?

1. Вы push в `main` ветку
2. Все тесты должны пройти
3. Если тесты пройдены → автоматический deploy

### Настройка deploy job

Текущий workflow требует настройки следующего скрипта на сервере:

```bash
#!/bin/bash
# /home/user/deploy.sh

cd /path/to/app
git pull origin main
docker-compose down
docker-compose up -d
docker-compose exec -T backend alembic upgrade head
```

Или используйте готовые GitHub Actions:

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.DEPLOY_KEY }}
    script: |
      cd /var/www/flash-cards
      git pull origin main
      docker-compose up -d --build
```

---

## Статус бейдж

Добавьте бейдж CI/CD статуса в README.md:

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/flash-cards/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/flash-cards/actions/workflows/ci-cd.yml)
```

---

## Troubleshooting

### CI/CD workflow не запускается

**Причины:**
1. Workflow отключен в Settings → Actions
2. `.github/workflows/ci-cd.yml` не в main ветке
3. Неправильное имя ветки в конфигурации

**Решение:**
```bash
git add .github/workflows/ci-cd.yml
git commit -m "Add CI/CD workflow"
git push
```

### Все тесты падают

**Шаг 1:** Проверьте логи в Actions вкладке

**Шаг 2:** Запустите тесты локально

```bash
# Backend
cd back
pytest tests/ -v

# Frontend
cd front
npm test
```

**Шаг 3:** Исправьте ошибки локально, затем push

### Workflow зависает

**Решение:** Добавьте timeout и избегайте бесконечных ожиданий

```yaml
jobs:
  backend-tests:
    timeout-minutes: 10
```

---

## Полезные команды

```bash
# Просмотр последних commits
git log --oneline -10

# Просмотр ветки, на которой вы находитесь
git branch -v

# Push в определённую ветку
git push origin feature/my-feature

# Pull последних изменений
git pull origin main
```

---

## Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [About status checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories/about-status-checks)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

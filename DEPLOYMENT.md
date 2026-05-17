# Развертывание и CI/CD

## Локальное развертывание

### Предварительные требования

- Docker и Docker Compose
- Git

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone <your-repo-url>
cd fullstack
```

2. **Создайте файл `.env` на основе `.env.example`:**
```bash
cp .env.example .env
```

3. **Обновите значения в `.env` для вашего окружения (опционально):**
```bash
# Измените SECRET_KEY, API ключи и другие конфиденциальные данные
```

4. **Запустите приложение:**
```bash
docker-compose up --build
```

5. **Приложение будет доступно по адресам:**
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **MinIO Console**: http://localhost:9001 (minioadmin:minioadmin)

### Остановка

```bash
docker-compose down
```

Для удаления всех данных (включая БД):
```bash
docker-compose down -v
```

---

## CI/CD Pipeline (GitHub Actions)

### Что делает pipeline?

1. **Тестирование Backend:**
   - Установка зависимостей Python
   - Запуск линтинга (flake8)
   - Выполнение тестов pytest с покрытием кода
   - Загрузка отчетов в Codecov

2. **Тестирование Frontend:**
   - Установка зависимостей Node.js
   - Запуск ESLint
   - Выполнение unit тестов
   - Попытка запуска E2E тестов

3. **Сборка Docker образов:**
   - Проверка корректности Dockerfile
   - Сборка образов backend и frontend
   - Кеширование слоев для ускорения сборки

4. **Валидация:**
   - Проверка синтаксиса docker-compose.yml

5. **Развертывание (только main ветка):**
   - Запуск на основе успешно пройденных проверок

### Настройка CI/CD

#### 1. GitHub Secrets

Для развертывания на production, добавьте следующие secrets в GitHub:

1. Откройте Settings → Secrets and variables → Actions
2. Добавьте следующие secrets:

```
DEPLOY_KEY          # SSH приватный ключ для подключения к серверу
DEPLOY_HOST         # Имя хоста или IP адрес сервера
DEPLOY_USER         # SSH пользователь
DEPLOY_PATH         # Путь на сервере для развертывания
DOCKER_REGISTRY     # (опционально) Docker Registry для публикации образов
DOCKER_USERNAME     # (опционально) Username для Docker Registry
DOCKER_PASSWORD     # (опционально) Password для Docker Registry
```

#### 2. Переменные окружения для CI/CD

Workflow использует следующие переменные для тестирования:
- `DATABASE_URL` - для подключения к тестовой БД
- `SECRET_KEY` - тестовый ключ безопасности
- S3 конфигурация - тестовые учетные данные MinIO

### Ветвления и события

Pipeline запускается при:
- Push в ветки `main` и `develop`
- Pull Request в ветки `main` и `develop`

Развертывание происходит только:
- На ветке `main`
- При успешном завершении всех тестов
- Только при push событиях

### Просмотр результатов

1. Откройте вкладку **Actions** в вашем GitHub репозитории
2. Выберите последний workflow run
3. Просмотрите логи каждого job

---

## Production развертывание

### Требования

1. **VPS/Server с Docker и Docker Compose**
2. **SSH доступ к серверу**
3. **Доменное имя (опционально)**
4. **SSL сертификат (рекомендуется)**

### Пример развертывания через SSH

Обновите workflow `deploy` job для SSH развертывания:

```yaml
deploy:
  steps:
    - uses: actions/checkout@v4
    
    - name: Deploy via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.DEPLOY_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_KEY }}
        script: |
          cd ${{ secrets.DEPLOY_PATH }}
          git pull origin main
          cp .env.production .env
          docker-compose down
          docker-compose pull
          docker-compose up -d
          docker-compose exec -T backend alembic upgrade head
```

### Структура развертывания на сервере

```
/var/www/fullstack/
├── back/
├── front/
├── docker-compose.yml
├── .env (с production значениями)
└── .env.example
```

### Инициализация на production сервере

1. **Подключитесь к серверу:**
```bash
ssh user@your-server.com
```

2. **Клонируйте репозиторий:**
```bash
cd /var/www
git clone <your-repo-url> fullstack
cd fullstack
```

3. **Создайте `.env` с production значениями:**
```bash
cp .env.example .env
nano .env  # Отредактируйте с реальными значениями
```

4. **Запустите приложение:**
```bash
docker-compose up -d
```

5. **Проверьте статус:**
```bash
docker-compose ps
docker-compose logs -f
```

---

## Мониторинг и логирование

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Здоровье сервисов

```bash
# Проверить статус контейнеров
docker-compose ps

# Проверить здоровье конкретного сервиса
docker inspect cards-backend | grep -A 10 "Health"
```

---

## Откат версии

```bash
# Посмотреть историю commits
git log --oneline

# Откатиться к определенному коммиту
git checkout <commit-hash>
docker-compose up --build
```

---

## Безопасность

### Правила для production

1. **Меняйте SECRET_KEY:**
   - Используйте сильный случайный ключ
   - Не коммитьте в репозиторий

2. **MinIO учетные данные:**
   - Меняйте MINIO_ROOT_PASSWORD на сложный пароль
   - Отключите дефолтную консоль если не нужна

3. **Database пароль:**
   - Используйте сильный пароль для PostgreSQL
   - Ограничьте сетевой доступ к БД

4. **CORS настройки:**
   - Обновите CORS_ORIGINS для вашего домена
   - Не используйте * в production

5. **API ключи:**
   - Используйте отдельные ключи для разработки и production
   - Регулярно ротируйте ключи

### Пример .env для production

```env
DB_USER=postgres_prod
DB_PASSWORD=<strong-random-password>
DB_NAME=cards_prod

MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<strong-random-password>

BACKEND_SECRET_KEY=<generate-with-secrets.token_urlsafe()>
WEATHER_API_KEY=<your-production-api-key>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Troubleshooting

### Container не запускается

```bash
# Проверьте логи
docker-compose logs <service-name>

# Пересоберите образ
docker-compose build --no-cache <service-name>

# Очистите все и начните заново
docker-compose down -v
docker-compose up --build
```

### Database connection errors

```bash
# Проверьте, что DB контейнер здоров
docker-compose ps db

# Проверьте environment переменные
docker-compose config | grep -A 5 "db:"
```

### Frontend не видит Backend

```bash
# Проверьте CORS настройки
docker-compose logs backend | grep -i cors

# Проверьте network connectivity
docker-compose exec frontend curl -i http://backend:8000/docs
```

---

## Полезные команды

```bash
# Масштабирование (если поддерживается)
docker-compose up -d --scale backend=2

# Обновление сервиса без downtime (если поддерживается)
docker-compose up -d --no-deps --build <service>

# Запуск команды в контейнере
docker-compose exec backend python -m pytest

# Создание backup БД
docker-compose exec db pg_dump -U postgres text_cards > backup.sql

# Восстановление из backup
docker-compose exec -T db psql -U postgres text_cards < backup.sql
```

---

## Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

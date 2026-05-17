# Конфигурация и переменные окружения

## Описание переменных окружения

### База данных

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|---------|
| `DB_USER` | postgres | Пользователь PostgreSQL |
| `DB_PASSWORD` | postgres | Пароль PostgreSQL |
| `DB_NAME` | text_cards | Имя базы данных |
| `DB_HOST` | db | Хост базы данных (в Docker это имя сервиса) |
| `DB_PORT` | 5432 | Порт PostgreSQL |
| `DB_PORT_EXPOSE` | 5432 | Порт для проброса из контейнера |

### MinIO (S3)

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|---------|
| `MINIO_ROOT_USER` | minioadmin | Пользователь MinIO |
| `MINIO_ROOT_PASSWORD` | minioadmin | Пароль MinIO |
| `S3_BUCKET` | my-bucket | Имя bucket'а |
| `S3_ENDPOINT` | http://minio:9000 | Endpoint MinIO (внутри Docker) |
| `S3_ACCESS_KEY` | minioadmin | Access key для S3 |
| `S3_SECRET_KEY` | minioadmin | Secret key для S3 |
| `S3_REGION` | us-east-1 | AWS регион |
| `MINIO_API_PORT` | 9000 | Порт API MinIO |
| `MINIO_CONSOLE_PORT` | 9001 | Порт консоли MinIO |

### Бэкенд (FastAPI)

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|---------|
| `BACKEND_SECRET_KEY` | your-super-secret-key-change-in-production | JWT секретный ключ (ИЗМЕНИТЕ НА PRODUCTION!) |
| `WEATHER_API_KEY` | 38053d514bc1805eeb57d04ffb5792d2 | OpenWeatherMap API ключ |
| `WEATHER_API_URL` | http://api.openweathermap.org/data/2.5/weather | URL погодного API |
| `CORS_ORIGINS` | http://localhost:3001,http://frontend:3001 | Разрешённые origins для CORS |
| `BACKEND_PORT` | 8000 | Порт бэкенда |

### Фронтенд (React)

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|---------|
| `REACT_APP_API_URL` | http://backend:8000 | URL бэкенд API |
| `REACT_APP_OLLAMA_URL` | http://ollama:11434 | URL Ollama AI сервиса |
| `FRONTEND_PORT` | 3001 | Порт фронтенда |

### Ollama (AI)

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|---------|
| `OLLAMA_BASE_URL` | http://ollama:11434 | Основной URL Ollama |
| `OLLAMA_PORT` | 11434 | Порт Ollama |

---

## Установка `.env` файла

### Шаг 1: Скопируйте пример

```bash
cp .env.example .env
```

### Шаг 2: Отредактируйте под свои нужды (опционально)

```bash
# На Linux/Mac
nano .env

# На Windows
notepad .env
```

### Шаг 3: Для production окружения

Создайте отдельный файл `.env.production`:

```bash
cp .env.example .env.production
```

И отредактируйте со своими production значениями.

---

## Генерация безопасного SECRET_KEY

### Python

```python
import secrets
print(secrets.token_urlsafe(32))
```

### Bash

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### OpenSSL

```bash
openssl rand -base64 32
```

---

## Локальная разработка

### Использование .env для разработки

```bash
# Скопируйте пример
cp .env.example .env

# Для локальной разработки обычно стандартные значения подходят
```

### Переопределение переменных для разработки

Вы можете временно переопределить переменные:

```bash
# Linux/Mac
export BACKEND_PORT=8001
docker-compose up

# PowerShell
$env:BACKEND_PORT="8001"
docker-compose up
```

### Docker переменные для разработки

Создайте `.env.dev`:

```env
DB_USER=postgres
DB_PASSWORD=dev-password
DB_NAME=text_cards_dev

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=dev-minio-password

BACKEND_SECRET_KEY=dev-secret-key-not-for-production
CORS_ORIGINS=http://localhost:3001,http://127.0.0.1:3001,http://localhost:8000
```

Используйте с `--env-file`:

```bash
docker-compose --env-file .env.dev up
```

---

## Production безопасность

### Обязательные изменения

1. **SECRET_KEY** - ГЕНЕРИРУЙТЕ СИЛЬНЫЙ КЛЮЧ!
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

2. **Database пароль** - используйте сложный пароль
```
DB_PASSWORD=Vk#92$xY@mP$qL7!zN#8gH$4jK%9pQ$5
```

3. **MinIO пароль** - используйте сложный пароль
```
MINIO_ROOT_PASSWORD=Tr#48$yZ@nM$fL9!wP#7hG%2jK$8qR$3
```

4. **CORS_ORIGINS** - установите ваш домен
```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

5. **API ключи** - используйте реальные production ключи

### Проверка безопасности

Перед развертыванием проверьте:

```bash
# Убедитесь, что .env не закоммичен
git status | grep ".env"

# Убедитесь, что SECRET_KEY сильный
grep "BACKEND_SECRET_KEY" .env | grep -v "change-in-production"

# Проверьте, что все чувствительные данные в .env
grep -E "password|key|secret" .env | head -10
```

---

## Использование с Docker Compose

### Автоматическое загружение .env

Docker Compose автоматически загружает `.env` файл из текущей директории:

```bash
docker-compose up
# Автоматически загружает .env
```

### Явное указание .env файла

```bash
docker-compose --env-file .env.production up -d
```

### Проверка загруженных переменных

```bash
docker-compose config | grep -A 20 "environment:"
```

---

## Переменные при развертывании

### GitHub Actions

Переменные для CI/CD устанавливаются в workflow файле:

```yaml
env:
  DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/text_cards
  SECRET_KEY: test-secret-key
  # ...
```

### Secrets в GitHub Actions

```yaml
env:
  DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
  DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
```

Добавляйте в Settings → Secrets and variables → Actions

---

## Примеры конфигураций

### Development

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=text_cards_dev
BACKEND_SECRET_KEY=dev-key-do-not-use-in-production
WEATHER_API_KEY=test-key
CORS_ORIGINS=http://localhost:3001,http://localhost:8000
```

### Staging

```env
DB_USER=postgres_staging
DB_PASSWORD=<random-strong-password>
DB_NAME=text_cards_staging
BACKEND_SECRET_KEY=<generate-new-key>
WEATHER_API_KEY=<production-key>
CORS_ORIGINS=https://staging.yourdomain.com
```

### Production

```env
DB_USER=postgres_prod
DB_PASSWORD=<random-very-strong-password>
DB_NAME=text_cards_prod
BACKEND_SECRET_KEY=<generate-new-secure-key>
WEATHER_API_KEY=<production-key>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
S3_ENDPOINT=https://s3.yourdomain.com
MINIO_ROOT_PASSWORD=<very-strong-password>
```

---

## Troubleshooting

### Переменные не загружаются

```bash
# Проверьте формат .env (должны быть KEY=VALUE)
cat .env

# Убедитесь, что файл в корне проекта
ls -la .env

# Пересоздайте контейнеры
docker-compose down
docker-compose up --build
```

### Неверные значения в контейнере

```bash
# Проверьте переменные в контейнере
docker-compose exec backend env | grep DB_

# Посмотрите конфиг, который видит docker-compose
docker-compose config
```

### Очистка и переинициализация

```bash
# Удалить контейнеры и volumes
docker-compose down -v

# Убедитесь в .env
cat .env

# Запустить заново
docker-compose up --build
```

---

## Дополнительные ресурсы

- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [12 Factor App - Config](https://12factor.net/config)
- [FastAPI Configuration](https://fastapi.tiangolo.com/advanced/settings/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

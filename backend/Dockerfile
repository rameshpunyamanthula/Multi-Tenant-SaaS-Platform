FROM node:20

WORKDIR /app

# Install PostgreSQL client and netcat
RUN apt-get update && \
    apt-get install -y postgresql-client netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copy everything (backend, scripts, migrations, etc.)
COPY . .

# Install backend dependencies from /app
RUN npm install

RUN chmod +x scripts/init-db.sh

ENV NODE_ENV=development

CMD ["sh", "scripts/init-db.sh"]

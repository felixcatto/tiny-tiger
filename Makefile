install:
	npm i

start:
	npx gulp dev

start-production:
	NODE_ENV=production node dist/bin/server.js

build:
	npx gulp build

analyze-bundle:
	ANALYZE=true npx vite build
	google-chrome dist/stats.html

migrate:
	npx knex migrate:latest

migrate-new:
	npx knex migrate:make $(arg)

migrate-rollback:
	npx knex migrate:rollback

migrate-list:
	npx knex migrate:list

database-build:
	docker build -t tiny_tiger_database services/database

database-up:
	docker run --rm -d -e POSTGRES_PASSWORD=1 \
	-p 5432:5432 \
	-v tiny_tiger_database:/var/lib/postgresql/data \
	--name=tiny_tiger_database \
	tiny_tiger_database

database-up-with-log:
	docker run --rm -e POSTGRES_PASSWORD=1 \
	-p 5432:5432 \
	-v tiny_tiger_database:/var/lib/postgresql/data \
	--name=tiny_tiger_database \
	tiny_tiger_database \
	postgres -c 'config_file=postgresql.conf'

database-down:
	docker stop tiny_tiger_database

database-seed:
	npx knex seed:run

database-seed-new:
	npx knex seed:make $(arg)

test:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand

test-file:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand --watch $(arg)

lint:
	npx eslint .
	npx tsc

caddy-reload-config:
	docker compose exec caddy caddy reload --config="/etc/caddy/Caddyfile"

compose-build:
	docker compose build

compose-up:
	docker compose up -d

compose-down:
	docker compose down

compose-log:
	docker compose logs -f

compose-migrate:
	docker compose exec app make migrate

compose-seed:
	docker compose exec app make database-seed

install:
	npm i

start:
	npx gulp dev

start-production: build
	NODE_ENV=production node dist/main/index.js

build:
	NODE_ENV=production npx gulp build

analyze-bundle:
	ANALYZE=true npx next build

migrate:
	npx knex migrate:latest

migrate-new:
	npx knex migrate:make $(arg)

migrate-rollback:
	npx knex migrate:rollback

migrate-list:
	npx knex migrate:list

database-build:
	docker build -t comingstorm_database services/database

database-up:
	docker run --rm -d -e POSTGRES_PASSWORD=1 \
	-p 5432:5432 \
	-v comingstorm_database:/var/lib/postgresql/data \
	--name=comingstorm_database \
	comingstorm_database

database-down:
	docker stop comingstorm_database

database-seed:
	npx knex seed:run

database-seed-new:
	npx knex seed:make $(arg)

test:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand --watch

test-file:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand --watch $(arg)

test-once:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand

lint:
	npx tsc

css-styles:
	npx sass --no-source-map public/css/src/bootstrap-grid.scss public/css/bootstrap-grid.css

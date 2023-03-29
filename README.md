# Description

SPA app using fastify + react + redux + postgress + objection orm. Yet another todolist :smile:. Also have users and authentification.

### Features

* Vite for frontend bundling and dev server setup :fire:
* SSR
* Caddy in front of Node for caching, serving static content and load balancing on 3 instances of app.
* One button deploy \*. So you need only Docker and Git installed on server. Node, Postgress and Caddy will be handled via Docker.

### Commands

*Development*
```
git clone https://github.com/felixcatto/tiny-tiger.git
cd tiny-tiger
make install         # only first time, install node packages
make database-build  # only first time, download database image
make database-up
make migrate         # only first time, create database structure
make database-seed   # only first time, for prepopulate database
make start
```

then go to `http://localhost:3000`

*Deploy*
```
git clone https://github.com/felixcatto/tiny-tiger.git
cd tiny-tiger
make compose-build
make compose-up
make compose-migrate # only first time, create database structure
make compose-seed    # only first time, for prepopulate database
```

then go to `http://localhost/`

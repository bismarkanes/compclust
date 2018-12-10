.PHONY: install run stop

install:
	mkdir -p volumes/db
	mkdir -p volumes/redis
	docker network create api-ext

run:
	docker-compose up -d --build

stop:
	docker-compose down

uninstall:
	rm -rf volumes/db/*
	rm -rf volumes/redis/*
	docker network rm api-ext

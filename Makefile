.PHONY: install run stop

install:
	docker network create api-ext
	mkdir -p volumes/db
	mkdir -p volumes/redis

run:
	docker-compose up -d --build

stop:
	docker-compose stop

uninstall:
	docker network create api-ext
	rm -rf volumes/db/*
	rm -rf volumes/redis/*

.PHONY: install run stop

install:
	docker network create api-ext

run:
	docker-compose up -d --build

stop:
	docker-compose stop

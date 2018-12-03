FROM postgres:9.6-alpine AS db
# get certs for https
RUN apk --update add ca-certificates
COPY *.sql /docker-entrypoint-initdb.d
RUN chmod a+r /docker-entrypoint-initdb.d/*
EXPOSE 5432

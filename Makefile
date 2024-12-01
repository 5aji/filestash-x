
BUILD_DATE ?= $(shell date +%Y%m%d)
BUILD_REF ?= $(shell git rev-parse HEAD)

GO_LDFLAGS += -X 'github.com/mickael-kerjean/filestash/server/common.BUILD_DATE=${BUILD_DATE}'
GO_LDFLAGS += -X 'github.com/mickael-kerjean/filestash/server/common.BUILD_REF=${BUILD_REF}'
all:
	make build_init
	make build_frontend
	make build_backend

build_init:
	go get -v ./...
	go generate -x ./server/...

build_frontend:
	make build_frontend_old
	cd public && make compress

build_frontend_old:
	NODE_ENV=production npm run build
	mkdir -p ./server/ctrl/static/www/canary/
	cp -R ./public/assets ./server/ctrl/static/www/canary/
	cp -R ./public/*.html ./server/ctrl/static/www/canary/

build_backend:
	CGO_ENABLED=1 go build --tags "fts5" -ldflags "${GO_LDFLAGS}" -o dist/filestash cmd/main.go

build_backend_arm64:
	CGO_ENABLED=1 GOOS=linux GOARCH=arm GOARM=7 CC=arm-linux-gnueabihf-gcc go build -ldflags "${GO_LDFLAGS}" -o dist/filestash cmd/main.go

build_backend_amd64:
	GOOS=linux CGO_ENABLED=1 GOARCH=amd64 CC=gcc go build -ldflags "${GO_LDFLAGS}" -o dist/filestash cmd/main.go

clean_frontend:
	rm -rf server/ctrl/static/www/

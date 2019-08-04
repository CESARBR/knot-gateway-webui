GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test ./...
GOGET=$(GOCMD) get -u -v

OS := $(shell uname -s | awk '{print tolower($$0)}')
BINARY = app
GOARCH = amd64

LDFLAGS = -ldflags="$$(govvv -flags)"

.PHONY: tools
tools:
	go get golang.org/x/tools/cmd/goimports
	go get github.com/kisielk/errcheck
	go get github.com/golangci/golangci-lint/cmd/golangci-lint
	go get github.com/axw/gocov/gocov
	go get github.com/matm/gocov-html
	go get github.com/ahmetb/govvv
	go get github.com/golang/dep/cmd/dep
	go get github.com/mitchellh/gox

.PHONY: run
run: bin
	./$(BINARY)-$(OS)-$(GOARCH) # Execute the binary

.PHONY: bin
bin:
	env CGO_ENABLED=0 GOOS=$(OS) GOARCH=${GOARCH} go build -a -installsuffix cgo ${LDFLAGS} -o ${BINARY}-$(OS)-${GOARCH} cmd/main.go ;

.PHONY: test
test:
	$(GOTEST)

.PHONY: lint
lint:
	golangci-lint run $(go list ./... | grep -v /vendor/)

.PHONY: cover
cover:
	${GOCMD} test -coverprofile=coverage.out ./... && ${GOCMD} tool cover -html=coverage.out

.SILENT: clean
.PHONY: clean
clean:
	$(GOCLEAN)
	@rm -f ${BINARY}-$(OS)-${GOARCH}
	@rm -f coverage.out

.PHONY: deps
deps:
	glide install
	glide up
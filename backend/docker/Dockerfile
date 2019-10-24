FROM golang:1.13.0-alpine AS builder
ARG GOARCH
ARG GOARM

WORKDIR /go/src/github.com/CESARBR/knot-gateway-webui/backend
COPY . .
RUN apk update \
    && apk add make git curl \
    && curl https://glide.sh/get | sh \
    && make tools \
    && make deps \
    && make bin \
    && mv app-* exe

ENTRYPOINT ["./exe"]
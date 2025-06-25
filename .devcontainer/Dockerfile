FROM oven/bun:alpine

RUN apk add --no-cache \
    git \
    curl \
    ca-certificates \
    bash \
    openssh-client

RUN bun install --global concurrently

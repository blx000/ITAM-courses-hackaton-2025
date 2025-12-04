FROM golang:1.25.5 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN --mount=type=cache,target="./root/.cache/go-build" CGO_ENABLED=0 GOOS=linux go build -o /out/cmd ./cmd

FROM gcr.io/distroless/static:nonroot AS backend
WORKDIR /app
COPY --from=builder /out/cmd .
COPY --from=builder /app/config/ ./config/
USER nonroot:nonroot
ENTRYPOINT [ "./cmd" ]

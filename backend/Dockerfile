# Etapa de build
FROM golang:1.25 AS build
WORKDIR /app
COPY . .
# Inicializa módulo se ainda não existir
RUN go mod init desafio-kanban || true
RUN go mod tidy
# Compila para Linux (Alpine)
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Etapa final
FROM alpine:3.19
WORKDIR /app
# Copia apenas o binário compilado
COPY --from=build /app/server /app/server
# Cria diretório para dados (será montado como volume)
RUN mkdir -p /app/data
# Variáveis de ambiente padrão
ENV PORT=8080
ENV TASKS_FILE=/app/data/tasks.json
EXPOSE 8080
CMD ["/app/server"]
package main

import (
	"log"
	"net/http"
	"os"
)

func getEnv(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

func main() {
	// caminho do arquivo de persistencia
	filePath := getEnv("TASKS_FILE", "data/tasks.json")

	// inicia store em memoria com persistencia em JSON
	store := newMemoryStore(filePath)

	// carrega tarefas do arquivo se existir
	store.loadFromFile()

	port := getEnv("PORT", "8080")

	log.Printf("backend rodando em http://localhost:%s\n", port)
	log.Printf("dados persistidos em: %s\n", filePath)

	if err := http.ListenAndServe(":"+port, makeHandler(store)); err != nil {
		log.Fatalf("erro ao iniciar servidor: %v", err)
	}
}

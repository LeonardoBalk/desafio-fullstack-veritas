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
	// inicia store em memoria
	store := newMemoryStore()

	port := getEnv("PORT", "8080")

	log.Printf("backend rodando em http://localhost:%s\n", port)

	if err := http.ListenAndServe(":"+port, makeHandler(store)); err != nil {
		log.Fatalf("erro ao iniciar servidor: %v", err)
	}
}
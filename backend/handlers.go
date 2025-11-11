package main

// importa as bibliotecas que serão usadas
import ( 
	"encoding/json" // biblioteca para manipulação de JSON
	"io" // biblioteca para operações de entrada e saída
	"net/http" // biblioteca para manipulação de requisições HTTP
	"strings" // biblioteca para manipulação de strings
)

// função para escrever uma resposta JSON
func writeJson(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

// função para escrever uma mensagem de erro em formato JSON
func writeError(w http.ResponseWriter, status int, message string) {
	writeJson(w, status, map[string]any{
		"success": false,
		"error":   message,
	})
}

// função para analisar o corpo JSON de uma requisição HTTP
func parseJsonBody(r *http.Request, dst any) error {
	defer func (body io.ReadCloser) {
		_ = body.Close()
	}(r.Body)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dst)
}

// cors simples para liberar acesso do frontend
func cors (next http.Handler) http.Handler {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// função para criar o manipulador HTTP
func makeHandler (store *MemoryStore) http.Handler {
	mux := http.NewServeMux()

	// manipulador para a rota /tasks
	mux.HandleFunc ("/tasks", func (w http.ResponseWriter, r *http.Request) {
		switch r.Method { // verifica o método HTTP da requisição
		case http.MethodGet: // se for GET, lista todas as tarefas
			tasks := store.list()
			writeJson(w, http.StatusOK, map[string]any{
				"success": true,
				"data": tasks,
			})
			return 
		case http.MethodPost: // se for POST, cria uma nova tarefa
			var in TaskInput
			if err := parseJsonBody(r, &in); err != nil {
				writeError(w, http.StatusBadRequest, "json invalido") // retorna erro se o JSON for inválido
				return
			}
			created, err := store.create(in)
			if err != nil {
				writeError(w, http.StatusBadRequest, err.Error()) // retorna erro se a criação falhar
				return
			}
			writeJson(w, http.StatusCreated, map[string]any{ // retorna a tarefa criada
				"success": true,
				"data": created,
			})
			return
		default:
			writeError(w, http.StatusMethodNotAllowed, "metodo nao permitido") // retorna erro se o método não for permitido
			return
		}
	})

	// manipulador para rotas com id /tasks/{id}
	mux.HandleFunc("/tasks/", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/tasks/") // extrai o ID da tarefa da URL
		if id == "" {
			writeError(w, http.StatusBadRequest, "rota nao encontrada") // retorna erro se o ID estiver ausente
			return
		}
		switch r.Method {
		case http.MethodGet: // se for GET, pega a tarefa pelo ID
			t, ok := store.get(id)
			if !ok {
				writeError(w, http.StatusNotFound, "task nao encontrada") // retorna erro se a tarefa não for encontrada
				return
			}
			writeJson(w, http.StatusOK, map[string]any{ // retorna a tarefa encontrada
				"success": true,
				"data": t,
			})
			return
		case http.MethodPut: // se for PUT, atualiza a tarefa pelo ID
			var in TaskInput
			if err := parseJsonBody(r, &in); err != nil {
				writeError(w, http.StatusBadRequest, "json invalido") // retorna erro se o JSON for inválido
				return
			}
			updated, err := store.update(id, in)
			if err != nil {
				writeError(w, http.StatusBadRequest, err.Error()) // retorna erro se a atualização falhar
				return
			}
			writeJson(w, http.StatusOK, map[string]any{ // retorna a tarefa atualizada
				"success": true,
				"data": updated,
			})
			return
		case http.MethodDelete: // se for DELETE, deleta a tarefa pelo ID
			ok := store.delete(id)
			if !ok {
				writeError(w, http.StatusNotFound, "task nao encontrada") // retorna erro se a tarefa não for encontrada
				return
			}
			writeJson(w, http.StatusOK, map[string]any{ // retorna sucesso
				"success": true,
			})
			return
		default:
			writeError(w, http.StatusMethodNotAllowed, "metodo nao permitido") // retorna erro se o método não for permitido
			return
		}
	})

	return cors(mux)
}
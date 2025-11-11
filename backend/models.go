package main

// importa as bibliotecas que serão usadas
import ( 
	"encoding/json" // biblioteca para manipulacao de json
	"errors" // biblioteca para manipulacao de erros
	"os" // biblioteca para operacoes de arquivo e ambiente
	"strconv" // biblioteca para conversao de tipos
	"sync"    // biblioteca para sincronizacao
	"time"    // biblioteca para manipulacao de tempo
)

// define os status para as tarefas
const (
	StatusAFazer      = "A Fazer" 
	StatusEmProgresso = "Em Progresso"
	StatusConcluida   = "Concluída"
)

// valida os status permitidos
var allowedStatus = map[string]bool{
	StatusAFazer:      true,
	StatusEmProgresso: true,
	StatusConcluida:   true,
}

// estrutura da tarefa
type Task struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// estrutura de entrada para criacao/atualizacao de tarefas
type TaskInput struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Status      *string `json:"status,omitempty"`
}

// armazenamento em memoria para as tarefas
type MemoryStore struct {
	mu       sync.RWMutex
	tasks    map[string]*Task
	nextID   int
	filePath string
}

// cria uma nova instancia do armazenamento em memoria
func newMemoryStore(file string) *MemoryStore {
	return &MemoryStore{
		tasks:    make(map[string]*Task),
		filePath: file,
	}
}

// gera o proximo id como string
func (s *MemoryStore) nextIDString() string {
	s.nextID++
	return strconv.Itoa(s.nextID)
}

// lista todas as tarefas
func (s *MemoryStore) list() []*Task {
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := make([]*Task, 0, len(s.tasks))
	for _, t := range s.tasks {
		copyTask := *t
		out = append(out, &copyTask)
	}
	return out
}

// obtem uma tarefa pelo id
func (s *MemoryStore) get(id string) (*Task, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	t, ok := s.tasks[id]
	return t, ok
}

// valida o status da tarefa
func validateStatus(status string) error {
	if !allowedStatus[status] {
		return errors.New("status invalido: use 'A Fazer', 'Em Progresso' ou 'Concluída'")
	}
	return nil
}

// cria uma nova tarefa
func (s *MemoryStore) create(in TaskInput) (*Task, error) {
	if in.Title == nil || *in.Title == "" {
		return nil, errors.New("titulo obrigatorio")
	}

	st := StatusAFazer
	if in.Status != nil && *in.Status != "" {
		if err := validateStatus(*in.Status); err != nil {
			return nil, err
		}
		st = *in.Status
	}

	now := time.Now().UTC()

	t := &Task{
		ID:        s.nextIDString(),
		Title:     *in.Title,
		Status:    st,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if in.Description != nil {
		t.Description = *in.Description
	}

	s.mu.Lock()
	s.tasks[t.ID] = t
	s.mu.Unlock()

	// persiste em arquivo se configurado
	s.saveToFile()

	return t, nil
}

// atualiza uma tarefa existente
func (s *MemoryStore) update(id string, in TaskInput) (*Task, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.tasks[id]
	if !ok {
		return nil, errors.New("task nao encontrada")
	}

	if in.Title != nil {
		if *in.Title == "" {
			return nil, errors.New("titulo obrigatorio")
		}
		existing.Title = *in.Title
	}
	if in.Description != nil {
		existing.Description = *in.Description
	}
	if in.Status != nil {
		if err := validateStatus(*in.Status); err != nil {
			return nil, err
		}
		existing.Status = *in.Status
	}

	existing.UpdatedAt = time.Now().UTC()

	// salva em background para nao travar
	go s.saveToFile()

	return existing, nil
}

// deleta uma tarefa pelo id
func (s *MemoryStore) delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.tasks[id]; !ok {
		return false
	}
	delete(s.tasks, id)

	// salva em background para nao travar
	go s.saveToFile()

	return true
}

// carrega tarefas de um arquivo json (se existir)
func (s *MemoryStore) loadFromFile() {
	if s.filePath == "" {
		return
	}
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		// se nao existir ou nao puder ler, segue em memoria
		return
	}
	var list []*Task
	if err := json.Unmarshal(data, &list); err != nil {
		// se o json estiver invalido, ignora
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	maxID := 0
	for _, t := range list {
		if t == nil || t.ID == "" {
			continue
		}
		// reconstroi o mapa
		copyTask := *t
		s.tasks[t.ID] = &copyTask

		// ajusta o proximo id
		if idInt, err := strconv.Atoi(t.ID); err == nil && idInt > maxID {
			maxID = idInt
		}
	}
	s.nextID = maxID
}

// salva tarefas em um arquivo json
func (s *MemoryStore) saveToFile() {
	if s.filePath == "" {
		return
	}

	// snapshot de leitura
	s.mu.RLock()
	list := make([]*Task, 0, len(s.tasks))
	for _, t := range s.tasks {
		copyTask := *t
		list = append(list, &copyTask)
	}
	s.mu.RUnlock()

	data, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return
	}

	// cria pasta se nao existir
	_ = os.MkdirAll(dirOf(s.filePath), 0755)

	_ = os.WriteFile(s.filePath, data, 0644)
}

// retorna a pasta de um caminho simples
func dirOf(path string) string {
	// busca a ultima barra para separar pasta do arquivo
	last := -1
	for i := len(path) - 1; i >= 0; i-- {
		if path[i] == '/' || path[i] == '\\' {
			last = i
			break
		}
	}
	if last <= 0 {
		return "."
	}
	return path[:last]
}
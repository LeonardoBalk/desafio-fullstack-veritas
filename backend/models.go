package main

// importa as bibliotecas que serão usadas
import ( 
	"errors" // biblioteca para manipulação de erros
	"strconv" // biblioteca para conversão de tipos
	"sync"    // biblioteca para sincronização
	"time"    // biblioteca para manipulação de tempo
)

// Define os status para as tarefas
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

// estrutura de entrada para criação/atualização de tarefas
type TaskInput struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Status      *string `json:"status,omitempty"`
}

// armazenamento em memória para as tarefas
type MemoryStore struct {
	mu     sync.RWMutex
	tasks  map[string]*Task
	nextID int
}

// cria uma nova instância do armazenamento em memória
func newMemoryStore() *MemoryStore {
	return &MemoryStore{
		tasks: make(map[string]*Task),
	}
}

// gera o próximo ID como string
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

// obtém uma tarefa pelo ID
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
	defer s.mu.Unlock()
	s.tasks[t.ID] = t

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
	return existing, nil
}

// deleta uma tarefa pelo ID
func (s *MemoryStore) delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.tasks[id]; !ok {
		return false
	}
	delete(s.tasks, id)
	return true
}

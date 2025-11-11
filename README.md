# Desafio Fullstack Veritas - Mini Kanban de Tarefas
<img width="1920" height="912" alt="image" src="https://github.com/user-attachments/assets/2a21bc42-95c0-458b-848a-42666de64ae3" />


Aplicação fullstack de gerenciamento de tarefas no estilo Kanban, desenvolvida com React no frontend e Go no backend. O projeto implementa três colunas fixas (A Fazer, Em Progresso e Concluídas), integra drag and drop, modal de edição e persistência de dados em arquivo JSON.

## Funcionalidades

### Frontend (React)
- Três colunas fixas: A Fazer, Em Progresso e Concluídas
- Adicionar tarefas com título e descrição opcional
- Editar tarefas (título, descrição e status)
- Mover tarefas entre colunas via drag and drop
- Excluir tarefas
- Feedbacks visuais (loading e erros)
- Modal para visualização e edição de tarefas

### Backend (Go)
- API RESTful com endpoints: GET, POST, PUT e DELETE para /tasks
- Armazenamento em memória com persistência opcional em arquivo JSON
- Validações básicas (título obrigatório e status válido)
- CORS configurado para permitir acesso do frontend
- Thread-safe com sync.RWMutex

### Bônus implementados
- Drag and drop para mover tarefas
- Persistência em arquivo JSON (data/tasks.json)
- Docker

## Como executar

### Opção 1: Docker Compose (Recomendado)

```bash
# clonar o repositório
git clone https://github.com/seu-usuario/desafio-fullstack-veritas.git
cd desafio-fullstack-veritas

# subir os serviços
docker compose up --build
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173

Observação:
- Os dados do backend são persistidos no volume local ./backend/data montado no container em /app/data.
- O arquivo configurado por padrão é /app/data/tasks.json.

Comandos úteis:
```bash
# parar e remover containers
docker compose down

# reconstruir do zero
docker compose build --no-cache
docker compose up

# logs
docker logs -f kanban-backend
docker logs -f kanban-frontend
```

### Opção 2: Execução Local

#### Backend (Go)
```bash
cd backend

# instalar dependências
go mod tidy

# executar
go run .

# ou compilar e executar
go build -o server .
./server
```

Variáveis de ambiente:
- PORT (padrão 8080)
- TASKS_FILE (ex.: data/tasks.json)

Exemplo com persistência:
```bash
PORT=8080 TASKS_FILE=data/tasks.json go run .
```

#### Frontend (React)
```bash
cd frontend

# instalar dependências
npm install

# executar em modo desenvolvimento
npm run dev
```

O frontend roda em http://localhost:5173 e consome a API em http://localhost:8080.

## Estrutura do projeto

```
desafio-fullstack-veritas/
├── backend/
│   ├── data/
│   │   └── tasks.json           # arquivo de persistência (criado e atualizado automaticamente)
│   ├── main.go                  # ponto de entrada do backend
│   ├── handlers.go              # handlers HTTP e rotas
│   ├── models.go                # modelos e regras de negócio
│   ├── Dockerfile               # dockerfile do backend
│   └── go.mod                   # módulo e dependências go
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx  # componente principal do kanban
│   │   │   ├── Column.jsx       # componente de coluna
│   │   │   ├── Task.jsx         # componente de tarefa
│   │   │   └── TaskModal.jsx    # modal de edição
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile               # dockerfile do frontend
│   └── package.json             # dependências node
├── docs/
│   ├── user-flow.png            # diagrama de fluxo do usuário (obrigatório)
│   └── data-flow.png            # diagrama de fluxo de dados (opcional)
├── docker-compose.yml
└── README.md
```

## Decisões técnicas

### Backend (Go)
1. Armazenamento em memória com persistência em JSON para simplificar a entrega sem banco de dados. Salvamento automático após cada operação de escrita (create, update, delete) e carga no start quando configurado.
2. Controle de concorrência via sync.RWMutex para leituras concorrentes e exclusão mútua em escritas.
3. Validação de status por lista de permitidos para evitar inconsistências (A Fazer, Em Progresso, Concluída).
4. Middleware CORS simples permitindo origens amplas durante desenvolvimento.
5. Separação por arquivos: models.go (dados e regras), handlers.go (rotas HTTP) e main.go (bootstrap e configuração).

### Frontend (React)
1. Drag and drop com @hello-pangea/dnd pela simplicidade e estabilidade do fork.
2. Estado centralizado em KanbanBoard, com atualizações otimistas ao arrastar e sincronização via API.
3. Modal para edição completa da tarefa.
4. Tailwind CSS para construção rápida de um tema dark minimalista, com colunas diferenciadas por cores no cabeçalho.
5. Componentização em KanbanBoard, Column, Task e TaskModal para clareza e manutenção.


## Limitações conhecidas

1. CORS permissivo para facilitar desenvolvimento.
2. Sem autenticação ou autorização.
3. IDs sequenciais simples, não ideais para cenários distribuídos.
4. Sem validação de tamanho de campos, podendo aceitar textos longos.
5. Sem paginação; todas as tarefas são carregadas de uma vez.

## Melhorias futuras

1. Migrar para banco de dados.
2. Implementar autenticação e controle de acesso.
3. Trocar IDs sequenciais por UUIDs.
4. Adicionar validações de tamanho e sanitização.
5. Implementar paginação e filtros.

## Tecnologias utilizadas

### Backend
- Go
- net/http
- encoding/json
- sync

### Frontend
- React
- Vite (dev server e build)
- @hello-pangea/dnd
- Tailwind CSS

### DevOps
- Docker
- Docker Compose


Projeto desenvolvido para o desafio técnico da Veritas.

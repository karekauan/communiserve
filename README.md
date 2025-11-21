# Communiserve

Aplicativo React Native com Expo, backend Ruby on Rails API e banco de dados PostgreSQL.

## Estrutura do Projeto

```
communiserve/
├── api/          # Backend Rails API
└── mobile/       # Frontend Expo React Native
```

## Tecnologias

- **Frontend**: Expo React Native (versão mais recente)
- **Backend**: Ruby on Rails 8.1.1 (API mode)
- **Banco de Dados**: PostgreSQL
- **Idioma**: Português (pt-BR)
- **Paleta de Cores**: Verde

## Configuração do Backend (Rails API)

### Pré-requisitos

- Ruby 3.2.0 ou superior
- PostgreSQL instalado e rodando
- Bundler instalado

### Configuração do PostgreSQL

Antes de criar o banco de dados, certifique-se de que o PostgreSQL está configurado:

1. Crie um usuário PostgreSQL (se necessário):
```bash
sudo -u postgres createuser -s karek
# ou
sudo -u postgres psql
CREATE USER karek WITH SUPERUSER PASSWORD 'sua_senha';
```

2. Ou configure o `config/database.yml` para usar um usuário existente.

### Instalação

1. Navegue até a pasta do backend:
```bash
cd api
```

2. Instale as dependências:
```bash
bundle install
```

3. Configure o banco de dados:
```bash
rails db:create
rails db:migrate
rails db:seed
```

4. Inicie o servidor:
```bash
rails server
```

O servidor estará rodando em `http://localhost:3000`

### Usuário Admin Padrão

O seed cria automaticamente um usuário admin com os seguintes dados:

- **Nome**: Kauan Costa
- **CPF**: 11056887982
- **Email**: costakauanantonye@gmail.com
- **Telefone**: 45991290579
- **Senha padrão**: admin123
- **Role**: admin

## Configuração do Frontend (Expo)

### Pré-requisitos

- Node.js 20.x LTS
- npm ou yarn

### Instalação

1. Navegue até a pasta do mobile:
```bash
cd mobile
```

2. As dependências já estão instaladas, mas se necessário:
```bash
npm install
```

3. Configure a URL da API:

Edite o arquivo `mobile/constants/api.js` e altere `API_BASE_URL` para:
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://localhost:3000`
- **Dispositivo físico**: Use o IP da sua máquina (ex: `http://192.168.1.100:3000`)

4. Inicie o app:
```bash
npm start
```

## Funcionalidades Implementadas

### Autenticação

- **Tela de Login**: Verifica CPF e solicita senha se o usuário existir
- **Tela de Registro**: Cria novos usuários com role "citizen" por padrão
- **Persistência de sessão**: Usa AsyncStorage para manter o usuário logado

### Telas

- ✅ Login
- ✅ Registro
- ✅ Home (mostra nome e role do usuário)

### Roles de Usuário

- **admin**: Administrador do sistema
- **citizen**: Cidadão (padrão para novos registros)
- **worker**: Trabalhador

## Próximos Passos

As seguintes telas ainda precisam ser implementadas:
- Mapa interativo
- Perfil do usuário
- Lista de usuários (apenas para admin)

## Estrutura de Dados

### User
- name (string)
- birthday (date)
- email (string, único)
- phone (string)
- cpf (string, único)
- password_digest (string)
- role (string: admin, citizen, worker)

### Address
- street (string)
- number (string)
- neighborhood (string)
- city (string)
- state (string)
- zipcode (string)
- user_id (foreign key)

## API Endpoints

### Autenticação

- `POST /auth/check_cpf` - Verifica se um CPF existe
  - Body: `{ "cpf": "11056887982" }`
  - Response: `{ "exists": true/false }`

- `POST /auth/login` - Faz login
  - Body: `{ "cpf": "11056887982", "password": "senha" }`
  - Response: `{ "user": {...}, "message": "..." }`

- `POST /auth/register` - Registra novo usuário
  - Body: `{ "user": {...}, "password": "senha" }`
  - Response: `{ "user": {...}, "message": "..." }`

## Desenvolvimento

### Rodar Backend e Frontend Simultaneamente

Em terminais separados:

**Terminal 1 (Backend)**:
```bash
cd api
rails server
```

**Terminal 2 (Frontend)**:
```bash
cd mobile
npm start
```

## Notas

- A senha padrão do admin é `admin123` - altere em produção!
- Certifique-se de que o PostgreSQL está rodando antes de executar as migrações
- Para desenvolvimento em dispositivo físico, use o IP da sua máquina na rede local


# Guia de Instalação e Configuração do PostgreSQL

## 1. Instalar o PostgreSQL

### Opção 1: Download Oficial
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador para Windows
3. Execute o instalador como administrador
4. Durante a instalação:
   - Anote a senha do usuário `postgres` (você vai precisar dela)
   - Mantenha a porta padrão (5432)
   - Instale todas as ferramentas

### Opção 2: Chocolatey (se tiver instalado)
```powershell
choco install postgresql
```

## 2. Verificar a Instalação

Após a instalação, abra o PowerShell e execute:
```powershell
psql --version
```

Se não funcionar, adicione o PostgreSQL ao PATH:
1. Abra "Editar as variáveis de ambiente do sistema"
2. Clique em "Variáveis de Ambiente"
3. Em "Variáveis do sistema", encontre "Path" e clique "Editar"
4. Adicione: `C:\Program Files\PostgreSQL\[versão]\bin`
5. Substitua `[versão]` pela versão instalada (ex: 16, 15, 14)

## 3. Configurar o Banco de Dados

### Passo 1: Conectar ao PostgreSQL
```powershell
psql -U postgres
```
Digite a senha que você definiu durante a instalação.

### Passo 2: Criar o Banco de Dados
```sql
CREATE DATABASE misterfit_pro;
```

### Passo 3: Criar o Usuário
```sql
CREATE USER misterfit_user WITH PASSWORD 'misterfit123';
```

### Passo 4: Conceder Permissões
```sql
GRANT ALL PRIVILEGES ON DATABASE misterfit_pro TO misterfit_user;
ALTER USER misterfit_user CREATEDB;
```

### Passo 5: Sair do psql
```sql
\q
```

## 4. Executar o Schema

```powershell
psql -U misterfit_user -d misterfit_pro -f backend/database/schema.sql
```

## 5. Configurar o Backend

O arquivo `backend/config.env` já foi criado com as configurações corretas.

## 6. Instalar Dependências do Backend

```powershell
cd backend
npm install
```

## 7. Iniciar o Servidor

```powershell
npm run dev
```

## Credenciais do Banco

- **Host:** localhost
- **Porta:** 5432
- **Database:** misterfit_pro
- **Usuário:** misterfit_user
- **Senha:** misterfit123

## Solução de Problemas

### Erro: "psql não é reconhecido"
- Adicione o PostgreSQL ao PATH do sistema
- Ou use o caminho completo: `"C:\Program Files\PostgreSQL\16\bin\psql.exe"`

### Erro de Conexão
- Verifique se o serviço PostgreSQL está rodando
- Abra "Serviços" do Windows e procure por "postgresql-x64-16"

### Erro de Autenticação
- Verifique se a senha está correta
- Tente conectar como `postgres` primeiro

## Próximos Passos

Após configurar o PostgreSQL:
1. Execute `cd backend && npm install`
2. Execute `npm run dev`
3. Em outro terminal, execute `npm run dev` (para o frontend)
4. Acesse http://localhost:5173 no navegador 
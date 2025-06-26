#!/bin/bash

echo "🚀 Configurando MisterFit Pro..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Instale o PostgreSQL 14+ primeiro."
    exit 1
fi

echo "✅ Node.js e PostgreSQL encontrados"

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

# Configurar banco de dados
echo "🗄️ Configurando banco de dados..."
read -p "Nome do banco de dados (padrão: misterfit_db): " db_name
db_name=${db_name:-misterfit_db}

read -p "Usuário PostgreSQL (padrão: postgres): " db_user
db_user=${db_user:-postgres}

read -p "Senha do PostgreSQL: " db_password

# Criar banco de dados
echo "Criando banco de dados..."
PGPASSWORD=$db_password psql -U $db_user -h localhost -c "CREATE DATABASE $db_name;" 2>/dev/null || echo "Banco já existe ou erro na criação"

# Executar schema
echo "Executando schema do banco..."
PGPASSWORD=$db_password psql -U $db_user -h localhost -d $db_name -f backend/database/schema.sql

# Configurar variáveis de ambiente do backend
echo "⚙️ Configurando variáveis de ambiente..."
cd backend
cp config.env .env

# Atualizar .env com as configurações do banco
sed -i "s/DB_NAME=.*/DB_NAME=$db_name/" .env
sed -i "s/DB_USER=.*/DB_USER=$db_user/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" .env

# Gerar JWT secret
jwt_secret=$(openssl rand -base64 32)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" .env

cd ..

echo "✅ Configuração concluída!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Iniciar o backend: cd backend && npm run dev"
echo "2. Iniciar o frontend: npm run dev"
echo "3. Acessar: http://localhost:3000"
echo ""
echo "📧 Contas de teste serão criadas automaticamente no primeiro acesso"
echo ""
echo "🔗 Backend: http://localhost:3001"
echo "🔗 Frontend: http://localhost:3000" 
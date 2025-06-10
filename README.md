########################################
<p>@author: VICTOR FELIPE SOARES VIEIRA</p>
<p>victorfsv@gmail.com</p>
<p>06/2025</p>
########################################

Pré-requisitos

•
Node.js 20+ instalado

•
npm ou pnpm

Backend (API)

Bash


cd user-journey-api

# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Executar API
npm start


A API estará disponível em: http://localhost:3000

Frontend

Bash


cd user-journey-frontend

# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm run dev --host


O frontend estará disponível em: http://localhost:5173

📡 Endpoints da API

GET /journeys

Retorna todas as jornadas processadas com estatísticas.

Parâmetros de query opcionais:

• campaign: Filtrar por campanha específica

• medium: Filtrar por medium específico

• content: Filtrar por content específico


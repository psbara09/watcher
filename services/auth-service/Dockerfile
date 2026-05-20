FROM node:18-alpine

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/auth-service/package.json ./services/auth-service/

# Install dependencies
RUN npm install --workspace=services/auth-service

# Copy shared package source and build
COPY packages/shared/ ./packages/shared/
RUN npm run build -w packages/shared

# Copy service source and build
COPY services/auth-service/ ./services/auth-service/
RUN npm run build -w services/auth-service

WORKDIR /app/services/auth-service

EXPOSE 3001

CMD ["node", "dist/index.js"]

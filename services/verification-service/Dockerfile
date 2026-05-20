FROM node:18-alpine

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/verification-service/package.json ./services/verification-service/

# Install dependencies
RUN npm install --workspace=services/verification-service

# Copy shared package source and build
COPY packages/shared/ ./packages/shared/
RUN npm run build -w packages/shared

# Copy service source and build
COPY services/verification-service/ ./services/verification-service/
RUN npm run build -w services/verification-service

WORKDIR /app/services/verification-service

EXPOSE 3003

CMD ["node", "dist/index.js"]

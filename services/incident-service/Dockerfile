FROM node:18-alpine

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/incident-service/package.json ./services/incident-service/

# Install dependencies
RUN npm install --workspace=services/incident-service

# Copy shared package source and build
COPY packages/shared/ ./packages/shared/
RUN npm run build -w packages/shared

# Copy service source and build
COPY services/incident-service/ ./services/incident-service/
RUN npm run build -w services/incident-service

WORKDIR /app/services/incident-service

EXPOSE 3002

CMD ["node", "dist/index.js"]

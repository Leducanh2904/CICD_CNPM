# Stage 1: build client
FROM node:20 AS clientbuilder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN node node_modules/vite/bin/vite.js build

# Stage 2: install server deps
FROM node:20 AS serverdeps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server ./

# Stage 3: runtime
FROM node:20
ENV NODE_ENV=production
WORKDIR /app/server
COPY --from=serverdeps /app/server /app/server
COPY --from=clientbuilder /app/client/dist /app/server/public
EXPOSE 10000
CMD ["node", "index.js"]

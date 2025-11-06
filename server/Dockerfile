# -------- Stage 1: BUILD CLIENT (Vite) --------
FROM node:20 AS clientbuilder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN sed -i 's/\r$//' node_modules/vite/bin/vite.js || true \
 && sed -i 's/\r$//' node_modules/.bin/vite || true \
 && node node_modules/vite/bin/vite.js build

# -------- Stage 2: Install SERVER deps (prod) --------
FROM node:20 AS serverdeps
WORKDIR /app/server

# Cài deps theo lockfile
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy mã nguồn server (đÃ CHẶN node_modules bằng .dockerignore)
COPY server ./

# Xóa mọi dấu vết bcrypt cũ (nếu vô tình bị copy) và build lại cho Linux
RUN rm -rf node_modules/bcrypt \
 && npm install bcrypt --build-from-source

# -------- Stage 3: Runtime --------
FROM node:20
ENV NODE_ENV=production
WORKDIR /app/server

COPY --from=serverdeps /app/server /app/server
COPY --from=clientbuilder /app/client/dist /app/server/public

EXPOSE 10000
CMD ["node", "index.js"]

# -------- Stage 1: BUILD CLIENT (Vite) --------
FROM node:20 AS clientbuilder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client ./

# Normalize CRLF đề phòng và gọi vite qua Node để tránh Permission denied
RUN sed -i 's/\r$//' node_modules/vite/bin/vite.js || true \
    && sed -i 's/\r$//' node_modules/.bin/vite || true \
    && node node_modules/vite/bin/vite.js build


# -------- Stage 2: Install SERVER deps (prod) --------
FROM node:20 AS serverdeps
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server ./

# -------- Stage 3: Runtime --------
FROM node:20
ENV NODE_ENV=production
WORKDIR /app/server

COPY --from=serverdeps /app/server /app/server
COPY --from=clientbuilder /app/client/dist /app/server/public

EXPOSE 10000
CMD ["node", "index.js"]

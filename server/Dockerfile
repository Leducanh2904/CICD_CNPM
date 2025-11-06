# ---------- Stage 1: build CLIENT ----------
FROM node:20 AS clientbuilder
WORKDIR /app

# Cài deps client
COPY client/package*.json ./client/
RUN cd client && npm ci

# Build client
COPY client ./client
RUN cd client && npm run build

# ---------- Stage 2: install SERVER deps ----------
FROM node:20 AS serverdeps
WORKDIR /app/server

COPY server/package*.json ./
# Prod deps đủ dùng (nếu bạn cần devDeps thì bỏ --omit=dev)
RUN npm ci --omit=dev

# ---------- Stage 3: final runtime ----------
FROM node:20
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy server code và node_modules
COPY --from=serverdeps /app/server/node_modules ./server/node_modules
COPY server ./server

# Copy build frontend vào image (để app.js serve từ ../client/dist)
COPY --from=clientbuilder /app/client/dist ./client/dist

# Render tự đặt PORT, đừng hardcode. EXPOSE chỉ là metadata, để 10000 cho hợp Render logs
EXPOSE 10000

# Chạy server
CMD ["node", "server/index.js"]

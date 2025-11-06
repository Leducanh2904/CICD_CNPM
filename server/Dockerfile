# -------- Stage 1: Build CLIENT (Vite) --------
FROM node:20 AS clientbuilder
WORKDIR /app/client

# Chỉ copy file khai báo để cache install
COPY ../client/package*.json ./
RUN npm ci

# Copy source client sau
COPY ../client ./

# (Tuỳ chọn) strip CRLF trong vite.js nếu bạn muốn đảm bảo tuyệt đối
# RUN sed -i 's/\r$//' node_modules/vite/bin/vite.js

# Build bằng script đã sửa ở bước (1)
RUN npm run build

# -------- Stage 2: Install SERVER deps (prod) --------
FROM node:20 AS serverdeps
WORKDIR /app/server

# Cài deps production của server
COPY package*.json ./
RUN npm ci --omit=dev

# Copy toàn bộ server source
COPY . .

# -------- Stage 3: Runtime --------
FROM node:20
ENV NODE_ENV=production
WORKDIR /app/server

# Copy server (code + node_modules)
COPY --from=serverdeps /app/server /app/server

# Copy client build thành static cho backend phục vụ
# client/dist -> server/public
COPY --from=clientbuilder /app/client/dist /app/server/public

# Render sẽ gán PORT (thường 10000)
EXPOSE 10000

# Start server (index.js của bạn đã listen PORT đúng chứ?)
CMD ["node", "index.js"]

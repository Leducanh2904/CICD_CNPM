# -------- Stage 1: Build CLIENT (Vite) --------
FROM node:20 AS clientbuilder
WORKDIR /app/client

# copy theo path từ repo root (context = .)
COPY client/package*.json ./
RUN npm ci

COPY client ./
# nếu đã sửa script build thành npx/node như đã hướng dẫn trước đó:
RUN npm run build
# hoặc: RUN npx vite build

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

# ----- Stage 1: Build CLIENT -----
FROM node:20-bullseye AS clientbuilder
WORKDIR /app

# copy package trước để cache install
COPY client/package*.json ./client/
# Dù NODE_ENV có là production đi nữa, vẫn buộc cài devDeps cho client
RUN cd client && npm ci --include=dev

# copy source client và build
COPY client ./client
RUN cd client && npm run build

# ----- Stage 2: Build SERVER (prod) -----
FROM node:20-bullseye AS serverdeps
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# ----- Stage 3: Runtime -----
FROM node:20-bullseye
WORKDIR /app

# Chỉ set ở stage chạy thực tế
ENV NODE_ENV=production \
    PORT=10000

# copy server code
COPY server ./server
# copy deps đã cài sẵn
COPY --from=serverdeps /app/server/node_modules ./server/node_modules
# copy build client vào public
COPY --from=clientbuilder /app/client/dist ./server/public

EXPOSE 10000
WORKDIR /app/server
CMD ["node", "index.js"]

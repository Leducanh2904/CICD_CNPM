# server/Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# chỉ copy package trước để cache layer
COPY package*.json ./
# cài deps production (loại devDeps)
RUN npm ci --omit=dev

# copy toàn bộ source còn lại
COPY . .

ENV NODE_ENV=production
# Render sẽ map PORT vào container, bạn chỉ cần lắng nghe process.env.PORT
EXPOSE 10000

CMD ["node", "index.js"]

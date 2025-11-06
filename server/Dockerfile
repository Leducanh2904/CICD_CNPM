# Sử dụng Node 20 nhỏ gọn
FROM node:20-alpine

WORKDIR /usr/src/app

# Chỉ copy file package để cache layer cài deps
COPY package*.json ./

# Cài prod deps
RUN npm ci --omit=dev

# Copy source còn lại
COPY . .

# Render sẽ inject PORT, app đọc process.env.PORT
EXPOSE 10000

# Chạy prod
ENV NODE_ENV=production
CMD ["npm", "start"]

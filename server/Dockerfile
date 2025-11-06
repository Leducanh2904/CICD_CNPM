FROM node:18

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Cài đúng theo lockfile, bỏ devDeps để image nhẹ
COPY package*.json ./
RUN npm ci --omit=dev

# Copy code
COPY . .

# Cổng mặc định (Render sẽ inject PORT, nhưng expose 8080 cho nhất quán)
EXPOSE 8080

# Chạy production, KHÔNG dùng nodemon
CMD ["npm", "start"]

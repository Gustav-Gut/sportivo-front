FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# Execute Angular development server, binding to all interfaces so it's accessible from host
CMD ["npm", "run", "start"]

FROM node:20-alpine

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install

COPY . .

# 🔑 Fix ownership for Turbopack
RUN chown -R node:node /home/node/app

USER node

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:lts-alpine
#FROM node:14

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY .env index.js ./

EXPOSE 5225
CMD [ "node", "index.js" ]
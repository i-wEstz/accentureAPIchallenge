FROM node:16-apline

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

# Bundle app source
COPY . .

EXPOSE 9000
CMD [ "yarn", "start" ]
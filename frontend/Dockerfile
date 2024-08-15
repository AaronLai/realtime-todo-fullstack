FROM node:20

WORKDIR /app

# Install Yarn if it's not already installed
RUN which yarn || npm install -g yarn

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]

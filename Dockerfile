FROM node:14.16.1-slim
WORKDIR /HeroPage
COPY package.json /HeroPage
RUN npm install
COPY . /HeroPage
CMD ["npm", "start"]
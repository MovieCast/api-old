FROM node

# Install MongoDB
RUN apt-get install mongodb-server -y

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Install gulp.js
RUN npm install -g gulp

# Bundle app source
COPY . /app

RUN gulp build

EXPOSE 8000
CMD ["npm", "start"]

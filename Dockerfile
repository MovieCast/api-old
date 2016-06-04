FROM node

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Install gulp.js
RUN npm install -g gulp
RUN gulp build

# Bundle app source
COPY . /app

EXPOSE 8000
CMD ["npm", "start"]

# [MovieCast API](https://github.com/MovieCast/api)
[![Build Status](https://travis-ci.org/MovieCast/api.svg?branch=master)](https://travis-ci.org/MovieCast/desktop)

Fetches movies from kat.cr

Before explaining anything we like to mention that if you are running the MovieCast API in a production environment, we highly recommend using Nginx as a reverse proxy.

## Usage
There are two ways to use this api, either by building it yourself, or by using Docker

#### Normal
For normal use you will have to follow a couple steps to build the project.
```
npm install -g gulp
npm install
gulp build
```
After this you will have to configure the api by checking out the [#Configuration](#configuration) section below.
When you are done with the configuration of the api, simply run `npm start` or `node dist`.

#### Docker
For using docker you can just run the following commands:
```
docker pull moviecast/api
docker run -t -i -d -p 8000:8000 -e MONGO_URL='the connection url for mongodb' \
-e TRAKT_API_KEY='trakt key goes here' moviecast/api
```
To see which environment variables you can set, checkout [configuration](https://github.com/MovieCast/api/wiki/Configuration).

## Configuration
See [configuration](https://github.com/MovieCast/api/wiki/Configuration), but first check out the simple guide below.

There are 2 ways to configure the api, lets start with the most straight forward one:
#### A config file
Create a `config.json` in the root of this repo (So where the README.md file is also located) and add the following content:
```json
{
    "mongo_url": "something like: mongodb://localhost/moviecast-api",
    "apis": {
        "trakt": {
            "key": "Your trakt.tv client id"
        }
    }
}
```
don't forget to fill in the correct information.

#### Environment variables
When using this method you have to atleast set the following variables:
  - MONGO_URL="something like: mongodb://localhost/moviecast-api"
  - TRAKT_API_KEY="Your trakt.tv client id"


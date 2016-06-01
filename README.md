# [MovieCast API](https://github.com/MovieCast/api)
Fetches movies from kat.cr

```
npm install -g gulp
npm install
gulp build
```
Then copy `config.example.json` over to `config.json` and change the trakt api key and any other things you like to change.

After that you can just run `node dest` or `nodemon dest`

## Usage

To use the MovieCast API in a production environment, we recommand using Nginx as a reverse proxy.

```
docker build -t moviecast-api .
docker run -t -i -d --restart=always -p 8000:8000 moviecast-api
```

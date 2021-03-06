[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# Ciabatta Timers Server

The server code for Ciabatta Timers.

## Configuration

The project uses [dotenv](https://www.npmjs.com/package/dotenv) to read any `.env*` files and adds any variables defined in them to `process.env`.

E.g. a `.env` file that looks contains `PORT=9000` will set `process.env.PORT` to `9000`.

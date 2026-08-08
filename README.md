# Portfolio

Static portfolio website for Pat Kamil Paluch.

## Project structure

The site is organized into clear folders:

- `index.html` for the page markup
- `css/` for stylesheets
- `js/` for scripts, including the hot-reload client
- `assets/` for images and other static assets
- `server/` for the local development watcher

## Local development

This project is a static HTML, CSS, JavaScript, and image site. It can be run locally from the project directory:

```bash
cd /Users/patpaluch/WEB/portfolio
python3 server/hot-reload-server.py
```

The development server listens on port `8000` and serves the site from the project root.

## File watching and hot reload

The project includes a lightweight hot-reload implementation:

- `server/hot-reload-server.py` serves the static files and watches the site directory for file changes.
- `js/live-reload.js` opens a browser-side EventSource connection to `/__livereload` and reloads the page when a reload event is emitted.
- `index.html` loads `js/live-reload.js` after `js/script.js` so the browser starts listening for reload events.

## Preview URL

Once the server is running, open:

http://127.0.0.1:8000/

## Domain

https://account.squarespace.com/domains/managed/kamilpaluch.com
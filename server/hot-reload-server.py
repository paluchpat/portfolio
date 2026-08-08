import asyncio
import http.server
import os
import socketserver
import threading
import time
from pathlib import Path

PORT = 8000
SITE_ROOT = Path(__file__).resolve().parent.parent

clients = []

def is_site_file(path: Path) -> bool:
    if not path.is_file():
        return False
    return path.suffix.lower() in {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.json', '.md', '.txt'}

class LiveReloadHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def do_GET(self):
        if self.path == '/__livereload':
            self.handle_livereload()
        else:
            super().do_GET()

    def handle_livereload(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.end_headers()

        clients.append(self.wfile)
        try:
            while True:
                time.sleep(1)
        except Exception:
            pass
        finally:
            if self.wfile in clients:
                clients.remove(self.wfile)

    def log_message(self, format, *args):
        return

class LiveReloadServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def send_reload_event():
    payload = 'event: reload\ndata: {}\n\n'
    stale = []
    for client in clients:
        try:
            client.write(payload.encode('utf-8'))
            client.flush()
        except Exception:
            stale.append(client)
    for stale_client in stale:
        if stale_client in clients:
            clients.remove(stale_client)


def watch_files():
    files = {}
    for root, _, filenames in os.walk(SITE_ROOT):
        for filename in filenames:
            path = Path(root) / filename
            if is_site_file(path):
                files[path] = path.stat().st_mtime_ns

    while True:
        changed = False
        current = {}
        for root, _, filenames in os.walk(SITE_ROOT):
            for filename in filenames:
                path = Path(root) / filename
                if is_site_file(path):
                    current[path] = path.stat().st_mtime_ns
                    if path not in files or files[path] != current[path]:
                        changed = True
                        files[path] = current[path]

        if changed:
            send_reload_event()

        time.sleep(0.5)

if __name__ == '__main__':
    server = LiveReloadServer(('127.0.0.1', PORT), LiveReloadHandler)

    watcher = threading.Thread(target=watch_files, daemon=True)
    watcher.start()

    print(f'Live-reload development server running on http://127.0.0.1:{PORT}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopping server...')
        server.server_close()

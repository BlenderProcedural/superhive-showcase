"""Local GIF studio server: static files, a cached fetch of the store's own assets, and POST /save/<name>."""
import hashlib, http.server, pathlib, re, sys, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parent
SRC, OUT = ROOT / "src", ROOT / "out"
ALLOWED = ("assets.superhivemarket.com", "blenderprocedural.github.io")

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == "/src":
            url = urllib.parse.parse_qs(u.query)["url"][0]
            if urllib.parse.urlparse(url).hostname not in ALLOWED:
                return self.send_error(403)
            ext = pathlib.PurePosixPath(urllib.parse.urlparse(url).path).suffix or ".bin"
            f = SRC / (hashlib.sha1(url.encode()).hexdigest()[:16] + ext)
            if not f.exists():
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=120) as r:
                    f.write_bytes(r.read())
            data = f.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", {".gif": "image/gif", ".png": "image/png", ".jpg": "image/jpeg"}.get(ext, "application/octet-stream"))
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        return super().do_GET()
    def do_POST(self):
        m = re.fullmatch(r"/save/([\w.-]+\.(?:gif|png|jpg|json))", self.path)
        if not m:
            return self.send_error(404)
        n = int(self.headers["Content-Length"])
        (OUT / m.group(1)).write_bytes(self.rfile.read(n))
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
    def log_message(self, fmt, *args):
        sys.stderr.write((fmt % args) + "\n")

http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()

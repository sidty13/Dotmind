import { Repository, Citation, ChatMessage, ActivityItem } from './types';

export const MOCK_REPOSITORIES: Repository[] = [
  {
    id: 'encode_starlette',
    owner: 'encode',
    name: 'starlette',
    url: 'https://github.com/encode/starlette',
    branch: 'master',
    status: 'ACTIVE',
    filesCount: 142,
    chunksCount: 612,
    lastIndexed: '12m ago',
    languages: [
      { name: 'Python', percent: 96 },
      { name: 'Markdown', percent: 4 },
    ],
  },
  {
    id: 'pallets_click',
    owner: 'pallets',
    name: 'click',
    url: 'https://github.com/pallets/click',
    branch: 'main',
    status: 'READY',
    filesCount: 48,
    chunksCount: 479,
    lastIndexed: '2h ago',
    languages: [
      { name: 'Python', percent: 98 },
      { name: 'Text', percent: 2 },
    ],
  },
  {
    id: 'tiangolo_fastapi',
    owner: 'tiangolo',
    name: 'fastapi',
    url: 'https://github.com/tiangolo/fastapi',
    branch: 'master',
    status: 'INDEXING',
    progressPercent: 65,
    filesCount: 280,
    chunksCount: 1420,
    lastIndexed: 'Just now',
    languages: [
      { name: 'Python', percent: 94 },
      { name: 'HTML', percent: 6 },
    ],
  },
  {
    id: 'vercel_nextjs',
    owner: 'vercel',
    name: 'next.js',
    url: 'https://github.com/vercel/next.js',
    branch: 'canary',
    status: 'READY',
    filesCount: 940,
    chunksCount: 4320,
    lastIndexed: '1d ago',
    languages: [
      { name: 'TypeScript', percent: 85 },
      { name: 'Rust', percent: 12 },
      { name: 'JS', percent: 3 },
    ],
  },
];

export const MOCK_CITATIONS: Citation[] = [
  {
    id: 1,
    filePath: 'starlette/routing.py',
    startLine: 142,
    endLine: 190,
    similarity: 0.88,
    githubUrl: 'https://github.com/encode/starlette/blob/master/starlette/routing.py#L142-L190',
    preview: `class Route(BaseRoute):
    def __init__(self, path: str, endpoint: typing.Callable, *, methods: typing.List[str] = None, name: str = None):
        assert path.startswith("/"), "Routed paths must start with '/'"
        self.path = path
        self.endpoint = endpoint
        self.name = get_name(endpoint) if name is None else name
        self.methods = None if methods is None else set(methods)
        self.path_regex, self.path_format, self.param_convertors = compile_path(path)`,
  },
  {
    id: 2,
    filePath: 'starlette/applications.py',
    startLine: 45,
    endLine: 82,
    similarity: 0.84,
    githubUrl: 'https://github.com/encode/starlette/blob/master/starlette/applications.py#L45-L82',
    preview: `class Starlette:
    def __init__(self, debug: bool = False, routes: typing.Sequence[BaseRoute] = None, middleware: typing.Sequence[Middleware] = None):
        self._debug = debug
        self.router = Router(routes)
        self.middleware_stack = self.build_middleware_stack()`,
  },
  {
    id: 3,
    filePath: 'starlette/routing.py',
    startLine: 68,
    endLine: 110,
    similarity: 0.81,
    githubUrl: 'https://github.com/encode/starlette/blob/master/starlette/routing.py#L68-L110',
    preview: `class Router:
    def __init__(self, routes: typing.Sequence[BaseRoute] = None, redirect_slashes: bool = True):
        self.routes = [] if routes is None else list(routes)
        self.redirect_slashes = redirect_slashes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        assert scope["type"] in ("http", "websocket", "lifespan")`,
  },
  {
    id: 4,
    filePath: 'starlette/responses.py',
    startLine: 12,
    endLine: 38,
    similarity: 0.74,
    githubUrl: 'https://github.com/encode/starlette/blob/master/starlette/responses.py#L12-L38',
    preview: `class Response:
    media_type = None
    charset = "utf-8"

    def __init__(self, content: typing.Any = None, status_code: int = 200, headers: typing.Mapping[str, str] = None):
        self.status_code = status_code
        self.raw_headers = [] if headers is None else list(headers.items())`,
  },
  {
    id: 5,
    filePath: 'starlette/middleware/base.py',
    startLine: 24,
    endLine: 60,
    similarity: 0.71,
    githubUrl: 'https://github.com/encode/starlette/blob/master/starlette/middleware/base.py#L24-L60',
    preview: `class BaseHTTPMiddleware:
    def __init__(self, app: ASGIApp, dispatch: DispatchFunction = None) -> None:
        self.app = app
        self.dispatch_func = self.dispatch if dispatch is None else dispatch`,
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'how does routing work in Starlette?',
    timestamp: '12:30',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: `Starlette handles routing through the \`Router\` and \`Route\` classes [1].

1. **Path Compilation**: Each \`Route\` compiles its URL pattern into regular expressions using \`compile_path()\` to extract dynamic path parameters with typing convertors [1].
2. **Matching Engine**: In \`Router.__call__\`, incoming ASGI scopes are evaluated against registered routes. If an HTTP or WebSocket scope matches the path and HTTP method, request handling is delegated to the underlying endpoint [2][3].
3. **Application Mount**: In \`Starlette.__init__\`, the core application delegates all dispatch lifecycle decisions directly to its \`Router\` instance [2].

\`\`\`python
# Example: Declarative Routing in Starlette
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse

async def homepage(request):
    return JSONResponse({"status": "ok"})

app = Starlette(routes=[
    Route("/", endpoint=homepage, methods=["GET"])
])
\`\`\`
`,
    timestamp: '12:31',
    citations: MOCK_CITATIONS,
  },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', time: '12:04', text: 'ingested encode/starlette (612 chunks)', type: 'ingest' },
  { id: 'a2', time: '12:31', text: 'asked: how does routing work?', type: 'query' },
  { id: 'a3', time: '13:15', text: 'switched active repo to encode/starlette', type: 'switch' },
  { id: 'a4', time: '14:02', text: 'asked: explain BaseHTTPMiddleware dispatch', type: 'query' },
  { id: 'a5', time: '14:48', text: 'ingested pallets/click (479 chunks)', type: 'ingest' },
];

export const MOCK_FILE_TREE = [
  { path: 'starlette/', isDir: true, cited: false, open: true },
  { path: 'starlette/routing.py', isDir: false, cited: true, lines: 450 },
  { path: 'starlette/applications.py', isDir: false, cited: true, lines: 180 },
  { path: 'starlette/responses.py', isDir: false, cited: true, lines: 340 },
  { path: 'starlette/requests.py', isDir: false, cited: false, lines: 260 },
  { path: 'starlette/datastructures.py', isDir: false, cited: false, lines: 520 },
  { path: 'starlette/exceptions.py', isDir: false, cited: false, lines: 95 },
  { path: 'starlette/types.py', isDir: false, cited: false, lines: 75 },
  { path: 'starlette/middleware/', isDir: true, cited: false, open: true },
  { path: 'starlette/middleware/base.py', isDir: false, cited: true, lines: 140 },
  { path: 'starlette/middleware/cors.py', isDir: false, cited: false, lines: 110 },
  { path: 'starlette/middleware/errors.py', isDir: false, cited: false, lines: 195 },
];

export const MOCK_FULL_CODE = `import typing
import re
from starlette.types import Scope, Receive, Send, ASGIApp
from starlette.convertors import Convertor, CONVERTOR_TYPES

PARAM_REGEX = re.compile("{([a-zA-Z_][a-zA-Z0-9_]*)(:[a-zA-Z_][a-zA-Z0-9_]*)}")

class BaseRoute:
    def matches(self, scope: Scope) -> typing.Tuple[typing.Any, Scope]:
        raise NotImplementedError()

class Route(BaseRoute):
    """
    Represents an individual path to endpoint mapping.
    """
    def __init__(
        self,
        path: str,
        endpoint: typing.Callable,
        *,
        methods: typing.List[str] = None,
        name: str = None,
        include_in_schema: bool = True
    ) -> None:
        assert path.startswith("/"), "Routed paths must start with '/'"
        self.path = path
        self.endpoint = endpoint
        self.name = get_name(endpoint) if name is None else name
        self.include_in_schema = include_in_schema

        if methods is None:
            self.methods = None
        else:
            self.methods = {method.upper() for method in methods}
            if "GET" in self.methods:
                self.methods.add("HEAD")

        self.path_regex, self.path_format, self.param_convertors = compile_path(path)

    def matches(self, scope: Scope) -> typing.Tuple[Match, Scope]:
        if scope["type"] == "http":
            match = self.path_regex.match(scope["path"])
            if match:
                matched_params = match.groupdict()
                for key, value in matched_params.items():
                    matched_params[key] = self.param_convertors[key].convert(value)
                child_scope = {"endpoint": self.endpoint, "path_params": matched_params}
                if self.methods and scope["method"] not in self.methods:
                    return Match.PARTIAL, child_scope
                return Match.FULL, child_scope
        return Match.NONE, {}

    async def handle(self, scope: Scope, receive: Receive, send: Send) -> None:
        if self.methods and scope["method"] not in self.methods:
            headers = {"Allow": ", ".join(self.methods)}
            response = PlainTextResponse("Method Not Allowed", status_code=405, headers=headers)
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)
`;

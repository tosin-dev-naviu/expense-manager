FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/queue/package.json packages/queue/package.json
COPY packages/validation/package.json packages/validation/package.json

EXPOSE 3000

CMD ["node", "-e", "require('node:http').createServer((_, response) => { response.writeHead(200, { 'content-type': 'text/plain' }); response.end('expense-manager web placeholder\\n'); }).listen(3000, '0.0.0.0', () => { console.log('web placeholder listening on http://0.0.0.0:3000'); });"]

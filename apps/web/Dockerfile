FROM node:20-alpine AS base
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install

COPY packages/shared packages/shared
COPY apps/web apps/web

RUN npm run build -w @zaria/shared
RUN npm run build -w @zaria/web

EXPOSE 4173
CMD ["npm", "run", "preview", "-w", "@zaria/web", "--", "--host", "0.0.0.0", "--port", "4173"]

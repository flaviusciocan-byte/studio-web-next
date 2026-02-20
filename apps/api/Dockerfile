FROM node:20-alpine AS base
WORKDIR /app

COPY package.json tsconfig.base.json .env.example ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm run build -w @zaria/shared
RUN npm run prisma:generate -w @zaria/api
RUN npm run build -w @zaria/api

EXPOSE 8080
CMD ["npm", "run", "start", "-w", "@zaria/api"]

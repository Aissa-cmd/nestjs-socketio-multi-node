FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# stage to install only production deps
FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev

## this is stage two, where the app actually runs
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY package-lock.json ./
COPY --from=build /app/dist ./dist/
COPY --from=deps /app/node_modules ./node_modules/
CMD [ "yarn", "start:prod"]

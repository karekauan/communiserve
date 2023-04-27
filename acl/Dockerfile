# BUILDER
FROM node:18-alpine AS builder

USER node

COPY --chown=node:node . /app
WORKDIR /app

RUN yarn install --frozen-lockfile && yarn build

# RUNNER
FROM node:18-alpine

USER node
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/dist /app/node_modules /app/package.json /app
WORKDIR /app

ENTRYPOINT ["npm", "run", "start:prod"]

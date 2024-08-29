FROM node:22.6-alpine AS common

WORKDIR /app
COPY package*.json ./


FROM common AS build
RUN npm install && npm install typescript genversion -g
COPY . ./

RUN tsc --project tsconfig.build.json
RUN genversion --esm build/version.js


FROM common

ENV NODE_ENV=production
RUN npm install
COPY --from=build /app/build/ .

CMD ["node", "index.js"]

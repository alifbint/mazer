FROM node:22 AS frontend

WORKDIR /frontend
COPY package*.json /frontend/
RUN npm install

COPY . /frontend
RUN npm run build

FROM nginx:latest
COPY --from=frontend /frontend/dist/ /usr/share/nginx/html

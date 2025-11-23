FROM node:18-alpine AS build
WORKDIR /app

# copy package files first for caching
COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# copy rest of files
COPY . .

# ensure index.html is at project root (Vite requires it)
# if your index.html lives at public/index.html, copy it to root
RUN if [ -f public/index.html ]; then cp public/index.html ./index.html; fi

RUN npm run build

# Production stage (nginx)
FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

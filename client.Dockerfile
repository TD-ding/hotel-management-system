FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:5173/ || exit 1
CMD ["npx", "vite", "preview", "--port", "5173", "--host", "0.0.0.0"]

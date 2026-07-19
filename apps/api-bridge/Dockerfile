FROM node:22-alpine
WORKDIR /app
COPY package.json index.js ./
ENV NODE_ENV=production PORT=8787
EXPOSE 8787
USER node
CMD ["node", "index.js"]

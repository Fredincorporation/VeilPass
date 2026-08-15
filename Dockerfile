FROM node:18-alpine
WORKDIR /usr/src/app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source
COPY . .

ENV NODE_ENV=development

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /work

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["npm", "test"]
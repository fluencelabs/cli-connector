FROM node:16-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . ./
RUN npm install --production --silent && npm run build
CMD ["npm", "run", "start"]

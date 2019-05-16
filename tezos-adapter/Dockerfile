FROM node:9.4

# expose ports
EXPOSE 3000

# install packages
COPY package*.json /
RUN npm install

# copy sources and build
COPY . /
RUN npm run build

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
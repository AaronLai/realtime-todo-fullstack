ARG NODE_VERSION=20
FROM node:${NODE_VERSION}

WORKDIR /app

# Install Yarn if it's not already installed
RUN which yarn || npm install -g yarn

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Declare ARGs after FROM for multi-stage builds
ARG PORT
ARG START_CMD

# Set environment variables from ARGs
ENV PORT=${PORT}
ENV START_CMD=${START_CMD}

# Use an argument to dynamically set the port
EXPOSE ${PORT}

# Add some debugging output
RUN echo "PORT is set to: ${PORT}"
RUN echo "START_CMD is set to: ${START_CMD}"

# Use environment variables to pass the command dynamically
CMD echo "About to run: yarn ${START_CMD}" && yarn ${START_CMD}
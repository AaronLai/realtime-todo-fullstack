FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install 

# Copy the rest of the application code
COPY . .


# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["yarn", "dev"]
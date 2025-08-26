# Use official Node.js 22.16.0 image as the base
     FROM node:22.16.0

     # Set working directory
     WORKDIR /app

     # Copy package.json and install dependencies
     COPY package.json .
     RUN npm install

     # Install FFmpeg
     RUN apt-get update && apt-get install -y ffmpeg

     # Copy all project files
     COPY . .

     # Expose the port the app runs on
     EXPOSE 3000

     # Start the application
     CMD ["npm", "start"]

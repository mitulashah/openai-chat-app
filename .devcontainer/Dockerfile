FROM node:20-bullseye

# Set npm progress to false for faster installs
RUN npm config set progress=false

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install basic development tools and utilities
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    gnupg2 \
    lsb-release \
    vim \
    htop \
    jq \
    net-tools \
    procps \
    sudo \
    less \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Update npm and install global packages
RUN npm install -g npm@latest && \
    npm install -g nodemon concurrently typescript ts-node nx serve http-server

# Create a cache directory for npm and configure npm to use it
RUN mkdir -p /home/node/.npm-cache && \
    npm config set cache /home/node/.npm-cache --global && \
    chown -R node:node /home/node/.npm-cache

# Add node user to sudoers with password-less access
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

# Switch to non-root user
USER node

# Configure workspace
WORKDIR /workspace

# Copy common configuration files
COPY --chown=node:node .devcontainer/.bashrc /home/node/.bashrc
COPY --chown=node:node .devcontainer/.gitconfig /home/node/.gitconfig

# Default command
CMD [ "sleep", "infinity" ]
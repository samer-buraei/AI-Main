# Use Ubuntu 22.04 (Jammy) which supports Gazebo Garden
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV USERNAME=ardupilot
ENV USER_UID=1000
ENV USER_GID=1000

# Install essential packages
RUN apt-get update && apt-get install -y \
    lsb-release \
    wget \
    gnupg \
    git \
    build-essential \
    cmake \
    python3-pip \
    python3-dev \
    sudo \
    tzdata \
    rapidjson-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Gazebo Garden and required components
RUN wget https://packages.osrfoundation.org/gazebo.gpg -O /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null && \
    apt-get update && \
    apt-get install -y \
    gz-garden \
    libgz-sim8-dev \
    libgz-rendering8-dev \
    libopencv-dev \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    && rm -rf /var/lib/apt/lists/*

# Install system tools and ArduPilot Dependencies
RUN apt-get update && apt-get install -y \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

# Install ArduPilot Dependencies (MAVProxy, etc.)
RUN pip3 install --no-cache-dir \
    mavproxy \
    pexpect \
    pymavlink \
    future \
    empy==3.3.4

# Create a non-root user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME
WORKDIR /home/$USERNAME

# Clone and Build ardupilot_gazebo plugin with error handling
RUN set -e && \
    echo "Cloning ardupilot_gazebo..." && \
    git clone https://github.com/ArduPilot/ardupilot_gazebo.git && \
    cd ardupilot_gazebo && \
    echo "Creating build directory..." && \
    mkdir build && cd build && \
    echo "Running cmake..." && \
    cmake .. -DCMAKE_BUILD_TYPE=RelWithDebInfo && \
    echo "Building with make..." && \
    make -j$(nproc) && \
    echo "Installing..." && \
    sudo make install && \
    echo "ardupilot_gazebo plugin built successfully"

# Setup ArduPilot SITL with error handling
RUN set -e && \
    echo "Cloning ArduPilot (this may take a while)..." && \
    git clone --recursive https://github.com/ArduPilot/ardupilot.git && \
    cd ardupilot && \
    echo "Configuring for SITL..." && \
    ./waf configure --board sitl && \
    echo "Building ArduCopter (this may take several minutes)..." && \
    ./waf copter && \
    echo "ArduPilot SITL built successfully"

# Environment Setup
ENV GZ_SIM_SYSTEM_PLUGIN_PATH=/usr/local/lib/ardupilot_gazebo
ENV GZ_SIM_RESOURCE_PATH=/usr/local/share/ardupilot_gazebo/models:/usr/local/share/ardupilot_gazebo/worlds
ENV PATH=$PATH:/home/$USERNAME/.local/bin:/home/$USERNAME/ardupilot/Tools/autotest:/home/$USERNAME/ardupilot/build/sitl/bin

# Expose Ports
# 14550: MAVLink to GCS
# 14551: MAVLink to other
# 8080: Gazebo GUI (if web) - Garden uses GzWeb? Usually it's desktop app.
EXPOSE 14550 14551

# Default Command
CMD ["/bin/bash"]


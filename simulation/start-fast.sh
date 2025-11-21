#!/bin/bash
# Fast startup script - skips rebuild if binary exists

export DISPLAY=${DISPLAY:-192.168.0.32:0.0}
cd /home/ardupilot/ardupilot

BINARY="/home/ardupilot/ardupilot/build/sitl/bin/arducopter"

# Check if binary exists and is recent (built in last hour)
if [ -f "$BINARY" ] && [ $(find "$BINARY" -mmin -60 2>/dev/null | wc -l) -gt 0 ]; then
    echo "[FAST] ArduCopter binary exists, skipping rebuild..."
    # Just verify it's configured (non-blocking)
    ./waf configure --board sitl >/dev/null 2>&1 || true
else
    echo "[BUILD] Building ArduCopter (this may take 2-3 seconds)..."
    ./waf configure --board sitl
    ./waf copter
fi

# Launch Gazebo first (if not already running)
if ! pgrep -f "gz sim.*iris_runway" > /dev/null; then
    echo "[START] Launching Gazebo..."
    gz sim -v 4 /usr/local/share/ardupilot_gazebo/worlds/iris_runway.sdf > /tmp/gazebo.log 2>&1 &
    sleep 1
fi

# Launch ArduCopter directly (bypass sim_vehicle.py overhead)
echo "[START] Launching ArduCopter SITL..."
$BINARY \
    --model gazebo-iris \
    --speedup 1 \
    --defaults Tools/autotest/default_params/copter.parm,Tools/autotest/default_params/gazebo-iris.parm \
    --sim-address=127.0.0.1 \
    -I0 > /tmp/arducopter.log 2>&1 &

# Wait for ArduCopter to be ready and connected to Gazebo
echo "[WAIT] Waiting for ArduCopter to initialize and connect to Gazebo..."
for i in {1..20}; do
    if pgrep -f "arducopter.*gazebo-iris" > /dev/null; then
        # Check if ArduCopter has connected (look for "Connection on serial port" in log)
        if grep -q "Connection on serial port" /tmp/arducopter.log 2>/dev/null; then
            echo "[OK] ArduCopter is ready and connected"
            sleep 2  # Give it a moment to stabilize
            break
        fi
    fi
    sleep 1
done

# Launch MAVProxy in a way that keeps it running
echo "[START] Launching MAVProxy..."
# Start MAVProxy in background, keep it running even if no initial heartbeat
(
    while true; do
        mavproxy.py \
            --master tcp:127.0.0.1:5760 \
            --out udp:0.0.0.0:14550 \
            --retries 5 \
            --baudrate 57600 \
            --non-interactive \
            >> /tmp/mavproxy.log 2>&1
        # If it exits, wait and retry
        echo "[WARN] MAVProxy exited, retrying in 5 seconds..." >> /tmp/mavproxy.log
        sleep 5
    done
) &
MAVPROXY_PID=$!

# Give MAVProxy a moment to start
sleep 5

# Verify MAVProxy is running
if pgrep -f "mavproxy.py" > /dev/null; then
    echo "[OK] MAVProxy is running on port 14550 (PID: $MAVPROXY_PID)"
else
    echo "[WARN] MAVProxy failed to start. Check /tmp/mavproxy.log"
fi

echo ""
echo "[READY] All components starting..."
echo "[INFO] ArduCopter: Port 5760"
echo "[INFO] MAVProxy: Port 14550 (UDP)"
echo "[INFO] Gazebo: GUI should appear"
echo "[INFO] Connect QGroundControl to UDP:14550"
echo ""
echo "[NOTE] Container will keep running. Press Ctrl+C to stop."
echo ""

# Keep script running and monitor processes
while true; do
    sleep 5
    # Check if processes are still alive
    if ! pgrep -f "arducopter.*gazebo-iris" > /dev/null; then
        echo "[WARN] ArduCopter process died. Check logs: /tmp/arducopter.log"
    fi
    if ! pgrep -f "mavproxy.py" > /dev/null; then
        echo "[WARN] MAVProxy process died. Check logs: /tmp/mavproxy.log"
    fi
done


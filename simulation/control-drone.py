#!/usr/bin/env python3
"""
Control ArduPilot SITL drone via MAVLink
"""
import time
from pymavlink import mavutil

# Connect to ArduCopter
print("Connecting to ArduCopter...")
connection = mavutil.mavlink_connection('tcp:127.0.0.1:5760', baud=57600)

# Wait for heartbeat
print("Waiting for heartbeat...")
connection.wait_heartbeat()
print(f"Connected! System: {connection.target_system}, Component: {connection.target_component}")

# Arm the drone
print("\n=== ARMING DRONE ===")
connection.mav.command_long_send(
    connection.target_system,
    connection.target_component,
    mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,
    0,
    1,  # 1 = arm
    0, 0, 0, 0, 0, 0, 0
)
print("Arm command sent!")

# Wait a moment
time.sleep(2)

# Check arming status
msg = connection.recv_match(type='HEARTBEAT', blocking=True, timeout=5)
if msg:
    print(f"System status: {msg.system_status}")
    if msg.system_status == mavutil.mavlink.MAV_STATE_ACTIVE:
        print("✅ Drone is ARMED!")
    else:
        print("⚠️ Drone arming status unclear")

# Takeoff
print("\n=== TAKEOFF ===")
print("Sending takeoff command to 5 meters...")
connection.mav.command_long_send(
    connection.target_system,
    connection.target_component,
    mavutil.mavlink.MAV_CMD_NAV_TAKEOFF,
    0,
    0, 0, 0, 0, 0, 0, 5.0  # Takeoff to 5 meters
)
print("Takeoff command sent!")

# Monitor altitude
print("\n=== MONITORING FLIGHT ===")
for i in range(20):
    msg = connection.recv_match(type='GLOBAL_POSITION_INT', blocking=True, timeout=2)
    if msg:
        alt = msg.relative_alt / 1000.0  # Convert to meters
        print(f"Altitude: {alt:.2f} meters")
    time.sleep(0.5)

# Land
print("\n=== LANDING ===")
connection.mav.command_long_send(
    connection.target_system,
    connection.target_component,
    mavutil.mavlink.MAV_CMD_NAV_LAND,
    0,
    0, 0, 0, 0, 0, 0, 0
)
print("Land command sent!")

# Wait for landing
time.sleep(3)

# Disarm
print("\n=== DISARMING ===")
connection.mav.command_long_send(
    connection.target_system,
    connection.target_component,
    mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM,
    0,
    0,  # 0 = disarm
    0, 0, 0, 0, 0, 0, 0
)
print("Disarm command sent!")

print("\n✅ Flight sequence complete!")


#!/usr/bin/env python3
"""Check if ArduCopter is actually connected to Gazebo"""
import time
from pymavlink import mavutil

print("=" * 60)
print("  CONNECTION DIAGNOSTICS")
print("=" * 60)

# Connect
print("\n[1] Connecting to ArduCopter...")
conn = mavutil.mavlink_connection('tcp:127.0.0.1:5760', baud=57600)
conn.wait_heartbeat(timeout=10)
print(f"✅ Connected! System: {conn.target_system}")

# Get system status
print("\n[2] Getting system status...")
for i in range(10):
    msg = conn.recv_match(blocking=False, timeout=1)
    if msg:
        msg_type = msg.get_type()
        if msg_type == 'HEARTBEAT':
            print(f"  Heartbeat: mode={msg.base_mode}, status={msg.system_status}")
        elif msg_type == 'SYS_STATUS':
            print(f"  System Status: sensors={msg.onboard_control_sensors_present}")
        elif msg_type == 'ATTITUDE':
            print(f"  Attitude: roll={msg.roll:.2f}, pitch={msg.pitch:.2f}, yaw={msg.yaw:.2f}")
        elif msg_type == 'GLOBAL_POSITION_INT':
            alt = msg.relative_alt / 1000.0
            print(f"  Position: alt={alt:.2f}m")
        elif msg_type == 'RC_CHANNELS':
            print(f"  RC Channels: {msg.chan1_raw}, {msg.chan2_raw}, {msg.chan3_raw}, {msg.chan4_raw}")
    time.sleep(0.5)

# Try to arm and see response
print("\n[3] Testing arm command...")
conn.mav.command_long_send(
    conn.target_system, conn.target_component,
    mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
    1, 0, 0, 0, 0, 0, 0, 0
)

print("  Waiting for response...")
for i in range(5):
    msg = conn.recv_match(type='COMMAND_ACK', blocking=False, timeout=1)
    if msg:
        print(f"  Command ACK: command={msg.command}, result={msg.result}")
        break
    time.sleep(1)

# Check if we get attitude updates (means connected to physics)
print("\n[4] Checking for attitude updates (indicates Gazebo connection)...")
attitude_count = 0
for i in range(10):
    msg = conn.recv_match(type='ATTITUDE', blocking=False, timeout=1)
    if msg:
        attitude_count += 1
        print(f"  Got attitude update #{attitude_count}: roll={msg.roll:.3f}")
    time.sleep(0.5)

if attitude_count > 0:
    print(f"\n✅ Got {attitude_count} attitude updates - Gazebo connection likely working!")
else:
    print(f"\n⚠️  No attitude updates - Gazebo connection may not be working")

print("\n" + "=" * 60)
print("  DIAGNOSTICS COMPLETE")
print("=" * 60)


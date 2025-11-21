#!/usr/bin/env python3
"""Control ArduPilot SITL drone - Arm, Takeoff, Fly, Land"""
import time
import sys
from pymavlink import mavutil

def main():
    print("=" * 50)
    print("  FIRESWARM DRONE CONTROL")
    print("=" * 50)
    
    # Connect to ArduCopter
    print("\n[1/6] Connecting to ArduCopter on tcp:127.0.0.1:5760...")
    try:
        conn = mavutil.mavlink_connection('tcp:127.0.0.1:5760', baud=57600)
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
    
    # Wait for heartbeat
    print("[2/6] Waiting for heartbeat...")
    try:
        conn.wait_heartbeat(timeout=15)
        print(f"✅ Connected! System ID: {conn.target_system}")
    except Exception as e:
        print(f"❌ No heartbeat received: {e}")
        return False
    
    # Arm the drone
    print("\n[3/6] Arming drone...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        1,  # 1 = arm
        0, 0, 0, 0, 0, 0, 0
    )
    time.sleep(3)
    
    # Check arming status
    msg = conn.recv_match(type='HEARTBEAT', blocking=True, timeout=5)
    if msg and msg.system_status == mavutil.mavlink.MAV_STATE_ACTIVE:
        print("✅ Drone is ARMED!")
    else:
        print("⚠️  Arming status unclear, continuing...")
    
    # Takeoff
    print("\n[4/6] Taking off to 5 meters...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0,
        0, 0, 0, 0, 0, 0, 5.0  # Takeoff to 5 meters
    )
    print("✅ Takeoff command sent!")
    
    # Monitor flight
    print("\n[5/6] Monitoring flight (15 seconds)...")
    print("  Time | Altitude | Speed")
    print("  -----|----------|-------")
    for i in range(15):
        msg = conn.recv_match(type='GLOBAL_POSITION_INT', blocking=False, timeout=1)
        if msg:
            alt = msg.relative_alt / 1000.0  # mm to meters
            vx = msg.vx / 100.0  # cm/s to m/s
            vy = msg.vy / 100.0
            speed = (vx**2 + vy**2)**0.5
            print(f"  {i+1:4d}s | {alt:6.2f}m  | {speed:.2f}m/s")
        else:
            print(f"  {i+1:4d}s | (no data)")
        time.sleep(1)
    
    # Land
    print("\n[6/6] Landing...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_NAV_LAND, 0,
        0, 0, 0, 0, 0, 0, 0
    )
    print("✅ Land command sent!")
    time.sleep(5)
    
    # Disarm
    print("\nDisarming...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        0,  # 0 = disarm
        0, 0, 0, 0, 0, 0, 0
    )
    print("✅ Disarm command sent!")
    
    print("\n" + "=" * 50)
    print("  ✅ FLIGHT SEQUENCE COMPLETE!")
    print("=" * 50)
    print("\nCheck the Gazebo window - you should see the drone move!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


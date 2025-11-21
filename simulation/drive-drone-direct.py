#!/usr/bin/env python3
"""Direct drone control with RC override - manual stick control"""
import time
import sys
from pymavlink import mavutil

def send_rc_override(conn, channels):
    """Send RC channel override commands"""
    # channels: [roll, pitch, throttle, yaw, ...]
    # Values: 1000-2000 (1500 = center, 1000 = min, 2000 = max)
    conn.mav.rc_channels_override_send(
        conn.target_system,
        conn.target_component,
        *channels
    )

def main():
    print("=" * 60)
    print("  FIRESWARM DRONE - DIRECT RC CONTROL")
    print("=" * 60)
    
    # Connect
    print("\n[1] Connecting to ArduCopter...")
    conn = mavutil.mavlink_connection('tcp:127.0.0.1:5760', baud=57600)
    conn.wait_heartbeat(timeout=15)
    print(f"✅ Connected! System: {conn.target_system}")
    
    # Arm
    print("\n[2] Arming drone...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        1, 0, 0, 0, 0, 0, 0, 0
    )
    time.sleep(2)
    print("✅ Armed!")
    
    # Set to Stabilize mode (manual control)
    print("\n[3] Setting to STABILIZE mode...")
    conn.mav.set_mode_send(
        conn.target_system,
        mavutil.mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED,
        0  # STABILIZE mode
    )
    time.sleep(1)
    print("✅ Mode set!")
    
    # Manual control sequence
    print("\n[4] Starting manual control sequence...")
    print("  - Hover (throttle up)")
    print("  - Move forward")
    print("  - Turn right")
    print("  - Return to center")
    print("  - Land")
    
    # Hover (throttle ~60%)
    print("\n  → Hovering (3 seconds)...")
    for i in range(30):
        # Roll: 1500 (center), Pitch: 1500 (center), Throttle: 1600 (60%), Yaw: 1500 (center)
        send_rc_override(conn, [1500, 1500, 1600, 1500, 0, 0, 0, 0])
        time.sleep(0.1)
    
    # Move forward (pitch forward)
    print("  → Moving forward (2 seconds)...")
    for i in range(20):
        send_rc_override(conn, [1500, 1600, 1600, 1500, 0, 0, 0, 0])  # Pitch forward
        time.sleep(0.1)
    
    # Turn right (yaw right)
    print("  → Turning right (2 seconds)...")
    for i in range(20):
        send_rc_override(conn, [1500, 1500, 1600, 1600, 0, 0, 0, 0])  # Yaw right
        time.sleep(0.1)
    
    # Return to center
    print("  → Returning to center (1 second)...")
    for i in range(10):
        send_rc_override(conn, [1500, 1500, 1600, 1500, 0, 0, 0, 0])
        time.sleep(0.1)
    
    # Reduce throttle (land)
    print("  → Landing (throttle down)...")
    for i in range(20):
        throttle = 1600 - (i * 10)  # Gradually reduce
        if throttle < 1000:
            throttle = 1000
        send_rc_override(conn, [1500, 1500, int(throttle), 1500, 0, 0, 0, 0])
        time.sleep(0.1)
    
    # Stop RC override (let ArduPilot take control)
    print("\n[5] Releasing control...")
    send_rc_override(conn, [0, 0, 0, 0, 0, 0, 0, 0])  # All zeros = release
    time.sleep(1)
    
    # Disarm
    print("\n[6] Disarming...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    )
    print("✅ Disarmed!")
    
    print("\n" + "=" * 60)
    print("  ✅ MANUAL CONTROL SEQUENCE COMPLETE!")
    print("=" * 60)
    print("\n💡 Check the Gazebo window - the drone should have moved!")
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


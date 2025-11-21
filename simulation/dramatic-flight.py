#!/usr/bin/env python3
"""Dramatic, visible flight sequence - big movements so you can see it!"""
import time
import sys
from pymavlink import mavutil

def send_rc(conn, roll, pitch, throttle, yaw):
    """Send RC override - values 1000-2000, 1500=center"""
    conn.mav.rc_channels_override_send(
        conn.target_system, conn.target_component,
        roll, pitch, throttle, yaw, 0, 0, 0, 0
    )

def main():
    print("=" * 70)
    print("  🚁 DRAMATIC FLIGHT SEQUENCE - BIG MOVEMENTS!")
    print("=" * 70)
    
    print("\n[1] Connecting...")
    conn = mavutil.mavlink_connection('tcp:127.0.0.1:5760', baud=57600)
    conn.wait_heartbeat(timeout=15)
    print(f"✅ Connected! System: {conn.target_system}")
    
    print("\n[2] Arming...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        1, 0, 0, 0, 0, 0, 0, 0
    )
    time.sleep(3)
    print("✅ ARMED!")
    
    print("\n[3] Setting STABILIZE mode...")
    conn.mav.set_mode_send(
        conn.target_system,
        mavutil.mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED,
        0  # STABILIZE
    )
    time.sleep(2)
    print("✅ Mode set!")
    
    print("\n" + "=" * 70)
    print("  STARTING DRAMATIC FLIGHT - WATCH GAZEBO WINDOW!")
    print("=" * 70)
    
    # BIG HOVER - High throttle
    print("\n[4] 🚀 BIG LIFTOFF (5 seconds) - Throttle MAX!")
    for i in range(50):
        send_rc(conn, 1500, 1500, 1900, 1500)  # High throttle
        time.sleep(0.1)
    print("✅ High altitude reached!")
    
    # BIG FORWARD - Strong pitch
    print("\n[5] ➡️  BIG FORWARD MOVEMENT (3 seconds) - Pitch forward!")
    for i in range(30):
        send_rc(conn, 1500, 1800, 1700, 1500)  # Strong forward pitch
        time.sleep(0.1)
    print("✅ Moved forward!")
    
    # BIG RIGHT ROLL
    print("\n[6] ➡️  BIG RIGHT ROLL (3 seconds) - Roll right!")
    for i in range(30):
        send_rc(conn, 1800, 1500, 1700, 1500)  # Roll right
        time.sleep(0.1)
    print("✅ Rolled right!")
    
    # BIG LEFT ROLL
    print("\n[7] ⬅️  BIG LEFT ROLL (3 seconds) - Roll left!")
    for i in range(30):
        send_rc(conn, 1200, 1500, 1700, 1500)  # Roll left
        time.sleep(0.1)
    print("✅ Rolled left!")
    
    # BIG YAW SPIN
    print("\n[8] 🔄 BIG YAW SPIN (3 seconds) - Rotating!")
    for i in range(30):
        yaw_val = 1500 + int(400 * (i / 30.0))  # Gradual yaw increase
        send_rc(conn, 1500, 1500, 1700, int(yaw_val))
        time.sleep(0.1)
    print("✅ Rotated!")
    
    # RETURN TO CENTER
    print("\n[9] 🎯 Returning to center (2 seconds)...")
    for i in range(20):
        send_rc(conn, 1500, 1500, 1700, 1500)
        time.sleep(0.1)
    
    # BIG DESCENT
    print("\n[10] ⬇️  BIG DESCENT (3 seconds) - Landing!")
    for i in range(30):
        throttle = 1700 - int(700 * (i / 30.0))  # Gradual descent
        if throttle < 1000:
            throttle = 1000
        send_rc(conn, 1500, 1500, throttle, 1500)
        time.sleep(0.1)
    print("✅ Landed!")
    
    # Release control
    print("\n[11] Releasing control...")
    send_rc(conn, 0, 0, 0, 0)
    time.sleep(1)
    
    # Disarm
    print("\n[12] Disarming...")
    conn.mav.command_long_send(
        conn.target_system, conn.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    )
    print("✅ Disarmed!")
    
    print("\n" + "=" * 70)
    print("  ✅ DRAMATIC FLIGHT COMPLETE!")
    print("=" * 70)
    print("\n💡 Did you see the drone move in Gazebo?")
    print("   - Big liftoff")
    print("   - Forward movement")
    print("   - Right/left rolls")
    print("   - Rotation")
    print("   - Landing")
    return True

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


#ifndef __BLDC_H
#define __BLDC_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>

/**
 * @brief BLDC Telemetry data structure for real-time FOC diagnostics.
 */
typedef struct {
    // Motor Speed 
    float rpm_actual;
    float rpm_target;

    // Phase Currents 
    float current_phase_a; // Amps
    float current_phase_b; // Amps
    float current_phase_c; // Amps

    // Phase Voltages 
    float voltage_phase_a; // Volts
    float voltage_phase_b; // Volts
    float voltage_phase_c; // Volts

    // FOC DQ Reference Frame 
    float i_d; // Direct current (Flux)
    float i_q; // Quadrature current (Torque)

    // Position & Timing 
    float angle_mechanical;  // 0-360 degrees
    float angle_electrical;  // 0-360 degrees
    uint64_t timestamp_ms;   // For time-series synchronization, realistic unix time in ms

    // Battery & Power 
    float battery_voltage;   // Bus voltage
    float battery_current;   // Total current draw
    float energy_used_wh;    // Progress tracking
    float energy_rem_wh;     // Capacity calculation

    // Observer/FOC Characteristics
    // Scaled 0-100 or raw values for radar comparison
    uint8_t bemf_strength;
    uint8_t obs_confidence;
    uint8_t pll_lock_status;
    uint8_t angle_error_deg;

} bldc_telemetry_t;


/**
 * @brief BLDC Settings structure for real-time FOC control parameters.
 */
typedef struct {
    // Motor identity
    float pole_pairs;
    float motor_kv;
    float phase_resistance;
    float phase_inductance;

    // FOC control
    float current_kp;
    float current_ki;
    float speed_kp;
    float speed_ki;
    float i_d_target;

    // Sensorless observer
    float pll_kp;
    float pll_ki;
    float bemf_filter_cutoff_hz;
    float observer_gain;
    float min_rpm_closed_loop;
    float max_rpm_open_loop;

    // Startup behavior
    float startup_ramp_time_ms;
    float alignment_current;
    uint8_t startup_mode;

    // Limits & protection
    float max_phase_current;
    float max_bus_voltage;
    float max_temperature;
    float current_derating_start;
} bldc_settings_t;

/**
 * @brief USB Message types for the unified USB queue
 */
typedef enum {
    USB_MSG_TELEMETRY,
    USB_MSG_SETTINGS,
    USB_MSG_DEBUG_STR,
    USB_MSG_ERROR
} usb_msg_type_t;

/**
 * @brief Unified USB message structure
 */
typedef struct {
    usb_msg_type_t type;
    union {
        bldc_telemetry_t telemetry;
        bldc_settings_t settings;
        char debug_str[64];
        uint32_t error_code;
    } data;
} usb_msg_t;

void TelemThread(void *argument);
void UsbThread(void *argument);
#ifdef __cplusplus
}
#endif

#endif /* __BLDC_H */

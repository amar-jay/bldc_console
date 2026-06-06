#ifndef __BLDC_H
#define __BLDC_H

#include <stdint.h>
#include "stm32f4xx_hal.h"

#ifdef __cplusplus
extern "C" {
#endif

/* -------------------------------------------------------------------------- */
/* Hardware Configuration                                                       */
/* -------------------------------------------------------------------------- */
// Uncomment this if using advanced timers with complementary outputs (e.g., TIM1, TIM8)
// #define BLDC_COMPLEMENTARY_DRIVE

/* -------------------------------------------------------------------------- */
/* Phase output mappings for TIM3                                                  */
/* -------------------------------------------------------------------------- */
#define PHASE_1_CH TIM_CHANNEL_1
#define CH1E       TIM_CCER_CC1E
#define CH1NE      TIM_CCER_CC1NE

#define PHASE_2_CH TIM_CHANNEL_2
#define CH2E       TIM_CCER_CC2E
#define CH2NE      TIM_CCER_CC2NE

#define PHASE_3_CH TIM_CHANNEL_3
#define CH3E       TIM_CCER_CC3E
#define CH3NE      TIM_CCER_CC3NE

/* -------------------------------------------------------------------------- */
/* Type definitions                                                             */
/* -------------------------------------------------------------------------- */

typedef enum {
    PHASE_FLOAT = 0,
    PHASE_PWM_HIGH,
    PHASE_PWM_LOW
} PhaseState;

/**
 * @brief BLDC hardware handle used by the low-level motor driver.
 */
typedef struct {
    TIM_HandleTypeDef *htim;
    uint32_t chA;
    uint32_t chB;
    uint32_t chC;
} BLDC_Handle_t;

/**
 * @brief BLDC Settings structure for real-time FOC control parameters.
 */
typedef struct {
    /* Motor identity */
    float pole_pairs;
    float motor_kv;
    float phase_resistance;
    float phase_inductance;

    /* FOC control */
    float current_kp;
    float current_ki;
    float speed_kp;
    float speed_ki;
    float i_d_target;

    /* Sensorless observer */
    float pll_kp;
    float pll_ki;
    float bemf_filter_cutoff_hz;
    float observer_gain;
    float min_rpm_closed_loop;
    float max_rpm_open_loop;

    /* Startup behavior */
    float startup_ramp_time_ms;
    float alignment_current;
    uint8_t startup_mode;

    /* Limits & protection */
    float max_phase_current;
    float max_bus_voltage;
    float max_temperature;
    float current_derating_start;
} bldc_settings_t;

/**
 * @brief BLDC Telemetry data structure for real-time FOC diagnostics.
 */
typedef struct {
    /* Motor speed */
    float rpm_actual;
    float rpm_target;

    /* Phase currents (Amps) */
    float current_phase_a;
    float current_phase_b;
    float current_phase_c;

    /* Phase voltages (Volts) */
    float voltage_phase_a;
    float voltage_phase_b;
    float voltage_phase_c;

    /* FOC DQ reference frame */
    float i_d;
    float i_q;

    /* Position and timing */
    float angle_mechanical;
    float angle_electrical;
    uint64_t timestamp_ms;

    /* Battery and power */
    float battery_voltage;
    float battery_current;
    float energy_used_wh;
    float energy_rem_wh;

    /* Observer/FOC characteristics */
    uint8_t bemf_strength;
    uint8_t obs_confidence;
    uint8_t pll_lock_status;
    uint8_t angle_error_deg;
} bldc_telemetry_t;

/**
 * @brief USB message types for the unified USB queue.
 */
typedef enum {
    USB_MSG_TELEMETRY,
    USB_MSG_SETTINGS,
    USB_MSG_DEBUG_STR,
    USB_MSG_ERROR
} usb_msg_type_t;

/**
 * @brief Unified USB message structure.
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

/* -------------------------------------------------------------------------- */
/* Public API                                                                   */
/* -------------------------------------------------------------------------- */

void bldc_comm_init(BLDC_Handle_t *motor);
void bldc_comm_set_duty(uint16_t duty);
void bldc_comm_commutate(uint8_t step);
void bldc_comm_enable(void);
void bldc_comm_disable(void);

void bldc_dronecan_init(void);
void bldc_dronecan_update(void);
void bldc_dronecan_pub(void);

void bldc_telem_init(void);
void bldc_telem_pub(void);
bldc_settings_t* bldc_get_settings(void);

void usb_msg_tx(usb_msg_t* msg, uint8_t* buf, uint16_t buf_size);
void usb_msg_rx(uint8_t *Buf, uint32_t *Len);

void TelemThread(void *argument);
void UsbThread(void *argument);

#ifdef __cplusplus
}
#endif

#endif /* __BLDC_H */

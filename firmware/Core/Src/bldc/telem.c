#include <math.h>
#include <stdint.h>
#include <string.h>
#include "cmsis_os2.h"
#include "main.h"
#include "bldc.h"
#include "stm32f4xx_hal.h"
#include "usb_device.h"

extern osMessageQueueId_t usbQueueHandle;

static bldc_telemetry_t telem_data;

static bldc_settings_t settings_data;

void gen_demo_telemetry(void)
{
    static float t = 0.0f;
    t += 0.01f;

    /* ---------------- RPM (motor dynamics) ---------------- */
    float rpm_base = 1500.0f;
    telem_data.rpm_actual =
        rpm_base
        + 400.0f * sinf(t)
        + 120.0f * sinf(2.7f * t);

    /* ---------------- Phase currents (3-phase model) ---------------- */
    float i_amp = 0.8f + 0.3f * sinf(0.8f * t);

    telem_data.current_phase_a = 2.0f + i_amp * sinf(t * 1.5f);
    telem_data.current_phase_b = 2.0f + i_amp * sinf(t * 1.5f + 2.094f); // 120°
    telem_data.current_phase_c = 2.0f + i_amp * sinf(t * 1.5f + 4.188f); // 240°

    /* ---------------- Phase voltages ---------------- */
    float v_amp = 0.5f + 0.1f * sinf(0.3f * t);

    telem_data.voltage_phase_a = 24.0f + v_amp * sinf(t * 0.3f);
    telem_data.voltage_phase_b = 24.0f + v_amp * sinf(t * 0.3f + 2.094f);
    telem_data.voltage_phase_c = 24.0f + v_amp * sinf(t * 0.3f + 4.188f);

    /* ---------------- DQ currents ---------------- */
    telem_data.i_d = 0.3f * sinf(0.7f * t);
    telem_data.i_q = 1.2f + 0.5f * sinf(0.9f * t);

    /* ---------------- Mechanical angle (integrated RPM) ---------------- */
    static float angle = 0.0f;
    angle += telem_data.rpm_actual * 0.001f;

    if (angle > 360.0f)
        angle -= 360.0f;

    telem_data.angle_mechanical = angle;

    /* ---------------- Electrical angle ---------------- */
    telem_data.angle_electrical = fmodf(angle * 7.0f, 360.0f);

    /* ---------------- Battery model ---------------- */
    telem_data.battery_voltage = 48.0f - 0.005f * t;
    telem_data.battery_current = 8.0f + 2.0f * sinf(0.5f * t);

    /* ---------------- Energy model (no longer zero) ---------------- */
    static float energy_used = 0.0f;
    energy_used += (telem_data.battery_voltage * telem_data.battery_current) * 0.00001f;

    telem_data.energy_used_wh = energy_used;
    telem_data.energy_rem_wh = 100.0f - energy_used;

    /* ---------------- Back EMF (correlated with RPM) ---------------- */
    telem_data.bemf_strength = (uint8_t)(fminf(255.0f, fabsf(0.01f * telem_data.rpm_actual * sinf(1.5f * t))));

    /* ---------------- Observer / control simulation ---------------- */
    telem_data.obs_confidence = (uint8_t)((0.7f + 0.3f * sinf(0.4f * t)) * 100.0f);

    telem_data.pll_lock_status = (fabsf(sinf(0.8f * t)) > 0.5f) ? 1 : 0;

    telem_data.angle_error_deg = (uint8_t)(fabsf(5.0f * sinf(1.1f * t)));

    telem_data.timestamp_ms = millis32();
}

void bldc_telem_init(void) {
	// Initialize telemetry data with demo values
  MX_USB_DEVICE_Init();
}

static usb_msg_t msg;
void bldc_telem_pub(void) {
		gen_demo_telemetry();
		msg.type = USB_MSG_TELEMETRY;
		memcpy(&msg.data.telemetry, &telem_data, sizeof(bldc_telemetry_t));

		// Send to USB queue
		if (usbQueueHandle != NULL) 
				osMessageQueuePut(usbQueueHandle, &msg, 0, 10);
}

// Global exposed getter for the settings structure for updates
bldc_settings_t* bldc_get_settings(void) {
    return &settings_data;
}

void TelemThread(void *argument) {
		for (;;) {
				bldc_telem_pub();
				osDelay(10); // 100ms delay for 10Hz update rate
				bldc_dronecan_pub();
				osDelay(90); // 100ms delay for 10Hz update rate
		}

}

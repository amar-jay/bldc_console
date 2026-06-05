#include "bldc.h"
#include "cmsis_os.h"
#include "main.h"
#include "usb_device.h"
#include "usbd_cdc.h"
#include "usbd_cdc_if.h"
#include "nanocbor/nanocbor.h"
#include <stdint.h>
#include <stdio.h>

extern osMessageQueueId_t usbQueueHandle;
extern USBD_HandleTypeDef hUsbDeviceFS;

/* ---------------- USB SEND (robust) ---------------- */

static uint8_t usb_send_blocking(uint8_t *data, uint16_t len)
{
    if (data == NULL || len == 0)
        return USBD_FAIL;

    for (uint32_t retry = 0; retry < 50; retry++)
    {
        if (hUsbDeviceFS.dev_state != USBD_STATE_CONFIGURED ||
            hUsbDeviceFS.pClassData == NULL)
        {
            osDelay(10);
            continue;
        }

        uint8_t status = CDC_Transmit_FS(data, len);

        if (status == USBD_OK)
            return USBD_OK;

        if (status != USBD_BUSY)
            return status;

        osDelay(2);
    }

    return USBD_BUSY;
}

/* ---------------- TELEMETRY ENCODE ---------------- */

static int usb_telem_encode(nanocbor_encoder_t* enc, usb_msg_t msg)
{
    nanocbor_fmt_array(enc, 2);

    nanocbor_fmt_uint(enc, msg.type);

    nanocbor_fmt_map(enc, 21);

    nanocbor_put_tstr(enc, "rpm");
    nanocbor_fmt_float(enc, msg.data.telemetry.rpm_actual);

    nanocbor_put_tstr(enc, "rpm_t");
    nanocbor_fmt_float(enc, msg.data.telemetry.rpm_target);

    nanocbor_put_tstr(enc, "i_a");
    nanocbor_fmt_float(enc, msg.data.telemetry.current_phase_a);

    nanocbor_put_tstr(enc, "i_b");
    nanocbor_fmt_float(enc, msg.data.telemetry.current_phase_b);

    nanocbor_put_tstr(enc, "i_c");
    nanocbor_fmt_float(enc, msg.data.telemetry.current_phase_c);

    nanocbor_put_tstr(enc, "v_a");
    nanocbor_fmt_float(enc, msg.data.telemetry.voltage_phase_a);

    nanocbor_put_tstr(enc, "v_b");
    nanocbor_fmt_float(enc, msg.data.telemetry.voltage_phase_b);

    nanocbor_put_tstr(enc, "v_c");
    nanocbor_fmt_float(enc, msg.data.telemetry.voltage_phase_c);

    nanocbor_put_tstr(enc, "i_d");
    nanocbor_fmt_float(enc, msg.data.telemetry.i_d);

    nanocbor_put_tstr(enc, "i_q");
    nanocbor_fmt_float(enc, msg.data.telemetry.i_q);

    nanocbor_put_tstr(enc, "ang_m");
    nanocbor_fmt_float(enc, msg.data.telemetry.angle_mechanical);

    nanocbor_put_tstr(enc, "ang_e");
    nanocbor_fmt_float(enc, msg.data.telemetry.angle_electrical);

    nanocbor_put_tstr(enc, "ts");
    nanocbor_fmt_uint(enc, msg.data.telemetry.timestamp_ms);

    nanocbor_put_tstr(enc, "v_bat");
    nanocbor_fmt_float(enc, msg.data.telemetry.battery_voltage);

    nanocbor_put_tstr(enc, "i_bat");
    nanocbor_fmt_float(enc, msg.data.telemetry.battery_current);

    nanocbor_put_tstr(enc, "e_used");
    nanocbor_fmt_float(enc, msg.data.telemetry.energy_used_wh);

    nanocbor_put_tstr(enc, "e_rem");
    nanocbor_fmt_float(enc, msg.data.telemetry.energy_rem_wh);

    nanocbor_put_tstr(enc, "bemf");
    nanocbor_fmt_uint(enc, msg.data.telemetry.bemf_strength);

    nanocbor_put_tstr(enc, "obs");
    nanocbor_fmt_uint(enc, msg.data.telemetry.obs_confidence);

    nanocbor_put_tstr(enc, "pll");
    nanocbor_fmt_uint(enc, msg.data.telemetry.pll_lock_status);

    nanocbor_put_tstr(enc, "ang_err");
    nanocbor_fmt_uint(enc, msg.data.telemetry.angle_error_deg);

    return nanocbor_encoded_len(enc);
}

/* ---------------- SETTINGS ENCODE ---------------- */

static int settings_encode(nanocbor_encoder_t* enc, usb_msg_t msg)
{
    nanocbor_fmt_array(enc, 2);
    nanocbor_fmt_uint(enc, USB_MSG_SETTINGS);

    nanocbor_fmt_map(enc, 2);

    nanocbor_put_tstr(enc, "kv");
    nanocbor_fmt_float(enc, msg.data.settings.motor_kv);

    nanocbor_put_tstr(enc, "pp");
    nanocbor_fmt_float(enc, msg.data.settings.pole_pairs);

    return nanocbor_encoded_len(enc);
}

/* ---------------- DEBUG ENCODE ---------------- */

static int usb_debug_encode(nanocbor_encoder_t* enc, usb_msg_t msg)
{
    nanocbor_fmt_array(enc, 2);
    nanocbor_fmt_uint(enc, USB_MSG_DEBUG_STR);

    nanocbor_put_tstr(enc, msg.data.debug_str);

    return nanocbor_encoded_len(enc);
}

/* ---------------- MAIN THREAD ---------------- */

void UsbThread(void *argument)
{
    usb_msg_t msg;
		uint8_t buf[1024];

    while (1)
    {
        osDelay(10);

        if (osMessageQueueGet(usbQueueHandle, &msg, NULL, 50) == osOK)
        {
            nanocbor_encoder_t enc;
            nanocbor_encoder_init(&enc, buf, sizeof(buf));

            int len = 0;

            switch (msg.type)
            {
                case USB_MSG_TELEMETRY:
                    len = usb_telem_encode(&enc, msg);
                    break;

                case USB_MSG_SETTINGS:
                    len = settings_encode(&enc, msg);
                    break;

                case USB_MSG_DEBUG_STR:
                    len = usb_debug_encode(&enc, msg);
                    break;

                case USB_MSG_ERROR:
                    nanocbor_fmt_array(&enc, 2);
                    nanocbor_fmt_uint(&enc, USB_MSG_ERROR);
                    nanocbor_fmt_uint(&enc, msg.data.error_code);
                    len = nanocbor_encoded_len(&enc);
                    break;

                default:
                    len = 0;
                    break;
            }

            if (len > 0)
            {
                usb_send_blocking(buf, (uint16_t)len);
            }
        }
    }
}

#include "main.h"
#include "stm32f4xx_hal.h"

void dwt_init(void)
{
    CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
    DWT->CYCCNT = 0;
    DWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;
}

uint64_t stm32_cycles64(void)
{
    static uint64_t high = 0;
    static uint32_t last = 0;

    uint32_t now = DWT->CYCCNT;

    if (now < last)
        high += 0x100000000ULL;

    last = now;

    return high | now;
}

uint64_t micros64(void)
{
    return stm32_cycles64() / (SystemCoreClock / 1000000ULL);
}

uint32_t millis32(void)
{
    return (uint32_t)(micros64() / 1000ULL);
}

// derive unique 128-bit ID from STM32 factory UID (96-bit) with deterministic padding
void get_device_id(uint8_t id[16])
{
    uint32_t *uid = (uint32_t *)UID_BASE;

    // STM32 factory UID is 96-bit (3 words)
    uint32_t uid0 = uid[0];
    uint32_t uid1 = uid[1];
    uint32_t uid2 = uid[2];

    // Pack into first 12 bytes (little-endian)
    id[0]  = (uint8_t)(uid0);
    id[1]  = (uint8_t)(uid0 >> 8);
    id[2]  = (uint8_t)(uid0 >> 16);
    id[3]  = (uint8_t)(uid0 >> 24);

    id[4]  = (uint8_t)(uid1);
    id[5]  = (uint8_t)(uid1 >> 8);
    id[6]  = (uint8_t)(uid1 >> 16);
    id[7]  = (uint8_t)(uid1 >> 24);

    id[8]  = (uint8_t)(uid2);
    id[9]  = (uint8_t)(uid2 >> 8);
    id[10] = (uint8_t)(uid2 >> 16);
    id[11] = (uint8_t)(uid2 >> 24);

    // Expand to 128-bit (deterministic padding)
    id[12] = 0xA5;
    id[13] = 0x5A;
    id[14] = 0xC3;
    id[15] = 0x3C;
}

static uint32_t lfsr = 0x12345678;

static uint32_t xorshift32(void)
{
    uint32_t x = lfsr;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    lfsr = x;
    return x;
}

uint32_t rand32(void)
{
#if HAL_RNG_MODULE_ENABLED
    uint32_t val;

    if (HAL_RNG_GenerateRandomNumber(&hrng, &val) == HAL_OK)
    {
        return val;
    }
    // fallback if RNG fails at runtime
#endif

    return xorshift32();
}
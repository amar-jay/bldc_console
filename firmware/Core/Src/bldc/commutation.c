#include "bldc.h"

extern TIM_HandleTypeDef htim3;

static BLDC_Handle_t bldc_h;

void bldc_comm_init(BLDC_Handle_t *motor){
	bldc_h = *motor;
	bldc_comm_enable(&bldc_h);
}

void bldc_comm_enable(BLDC_Handle_t *m)
{
    __HAL_TIM_MOE_ENABLE(m->htim);   // Main output enable (TIM1/TIM8)
}

void bldc_comm_disable(BLDC_Handle_t *m)
{
    // Stop all PWM channels
    HAL_TIM_PWM_Stop(m->htim, PHASE_1_CH);
    HAL_TIM_PWM_Stop(m->htim, PHASE_2_CH);
    HAL_TIM_PWM_Stop(m->htim, PHASE_3_CH);

    // Ensure duty cycles are zeroed
    __HAL_TIM_SET_COMPARE(m->htim, PHASE_1_CH, 0);
    __HAL_TIM_SET_COMPARE(m->htim, PHASE_2_CH, 0);
    __HAL_TIM_SET_COMPARE(m->htim, PHASE_3_CH, 0);

    // Force all outputs off
    __HAL_TIM_MOE_DISABLE(m->htim);
    m->htim->Instance->CCER &= ~(CH1E | CH1NE |
                                 CH2E | CH2NE |
                                 CH3E | CH3NE);
}

// set phases with complementary outputs.
static void set_phase(TIM_TypeDef *TIMx,
                      uint32_t chE,
                      uint32_t chNE,
                      PhaseState state)
{
    switch (state)
    {
        case PHASE_PWM_HIGH:
            // Enable high-side PWM, disable low-side
            TIMx->CCER |= chE;
            TIMx->CCER &= ~chNE;
            break;

        case PHASE_PWM_LOW:
            // Disable high-side, enable complementary (low-side PWM)
            TIMx->CCER &= ~chE;
            TIMx->CCER |= chNE;
            break;

        case PHASE_FLOAT:
        default:
            // Disable both outputs (true Hi-Z)
            TIMx->CCER &= ~(chE | chNE);
            break;
    }
}

void bldc_comm_set_duty(BLDC_Handle_t *m, uint16_t duty)
{
    __HAL_TIM_SET_COMPARE(m->htim, m->chA, duty);
    __HAL_TIM_SET_COMPARE(m->htim, m->chB, duty);
    __HAL_TIM_SET_COMPARE(m->htim, m->chC, duty);
}

void bldc_comm_commutate(BLDC_Handle_t *m, uint8_t step)
{
    TIM_TypeDef *t = m->htim->Instance;

    switch (step)
    {
        case 1:
            // A+ B- C float
            set_phase(t, CH1E, CH1NE, PHASE_PWM_HIGH);
            set_phase(t, CH2E, CH2NE, PHASE_PWM_LOW);
            set_phase(t, CH3E, CH3NE, PHASE_FLOAT);
            break;

        case 2:
            // A+ C- B float
            set_phase(t, CH1E, CH1NE, PHASE_PWM_HIGH);
            set_phase(t, CH2E, CH2NE, PHASE_FLOAT);
            set_phase(t, CH3E, CH3NE, PHASE_PWM_LOW);
            break;

        case 3:
            // B+ C- A float
            set_phase(t, CH1E, CH1NE, PHASE_FLOAT);
            set_phase(t, CH2E, CH2NE, PHASE_PWM_HIGH);
            set_phase(t, CH3E, CH3NE, PHASE_PWM_LOW);
            break;

        case 4:
            // B+ A- C float
            set_phase(t, CH1E, CH1NE, PHASE_PWM_LOW);
            set_phase(t, CH2E, CH2NE, PHASE_PWM_HIGH);
            set_phase(t, CH3E, CH3NE, PHASE_FLOAT);
            break;

        case 5:
            // C+ A- B float
            set_phase(t, CH1E, CH1NE, PHASE_PWM_LOW);
            set_phase(t, CH2E, CH2NE, PHASE_FLOAT);
            set_phase(t, CH3E, CH3NE, PHASE_PWM_HIGH);
            break;

        case 6:
            // C+ B- A float
            set_phase(t, CH1E, CH1NE, PHASE_FLOAT);
            set_phase(t, CH2E, CH2NE, PHASE_PWM_LOW);
            set_phase(t, CH3E, CH3NE, PHASE_PWM_HIGH);
            break;

        default:
            bldc_comm_disable(m);
            break;
    }
}
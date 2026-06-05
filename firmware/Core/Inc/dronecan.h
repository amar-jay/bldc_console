#ifndef __DRONECAN_H
#define __DRONECAN_H

#ifdef __cplusplus
extern "C" {
#endif

#include "canard.h"
#include "bldc.h"

void dronecan_init(void);
void dronecan_update(void);
void dronecan_publish_node_status(void);
void dronecan_publish_esc_status(void);

#ifdef __cplusplus
}
#endif

#endif /* __DRONECAN_H */

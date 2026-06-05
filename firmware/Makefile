ELF_FILE = build/Debug/demo_stm32f411.elf


build: clean
	cmake --preset Debug 
	cmake --build --preset Debug

bin_create:
		arm-none-eabi-objcopy -O binary ${ELF_FILE} build/firmware.bin
		arm-none-eabi-objcopy -O ihex  ${ELF_FILE} build/firmware.hex

flash: build bin_create
	if command -v openocd >/dev/null 2>&1; then \
		cd build && \
		openocd -f interface/stlink.cfg -f target/stm32f4x.cfg \
		  -c "program Debug/demo_stm32f411.elf verify reset exit"; \
	else \
		echo "No suitable flashing tool found. Please install openocd"; \
		exit 1; \
	fi


# =========================
# DSDL GEN DRONCAN
# =========================
BASE=firmware/Middleware/Third_Party
CANARD_BASE=$(BASE)/libcanard
GEN_DIR=$(BASE)/dsdl_generated

dsdl_gen:
	git clone --depth 1 https://github.com/DroneCAN/DSDL

dsdlc:
	git clone --depth 1 https://github.com/DroneCAN/dronecan_dsdlc

dsdl_gen_build: dsdl_gen dsdlc
	python3 dronecan_dsdlc/dronecan_dsdlc.py \
		-O $(GEN_DIR) \
		DSDL/uavcan \
		DSDL/dronecan

# dsdl_build: dsdl_gen_build servo_node.c
# 	$(CC) -o servo_node servo_node.c $(LIBS) $(CFLAGS)

clean:
	rm -rf build DSDL $(GEN_DIR)

.PHONY: bin_create flash clean
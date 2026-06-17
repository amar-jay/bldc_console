BOARD = stm32g431
ELF_FILE = build/Debug/$(BOARD).elf


build: dsdl_gen
	cmake --preset Debug 
	cmake --build --preset Debug

bins:
		arm-none-eabi-objcopy -O binary $(ELF_FILE) build/firmware.bin
		arm-none-eabi-objcopy -O ihex  $(ELF_FILE) build/firmware.hex

flash: build bins
	if command -v openocd >/dev/null 2>&1; then \
		cd build && \
		openocd -f interface/stlink.cfg -f target/$(BOARD).cfg \
		  -c "program Debug/$(BOARD).elf verify reset exit"; \
	else \
		echo "No suitable flashing tool found. Please install openocd"; \
		exit 1; \
	fi


# =========================
# DSDL GEN DRONCAN
# =========================
CURRENT_DIRNAME = $(shell basename $(CURDIR))
TP_BASE=Middlewares/Third_Party
GEN_DIR=$(TP_BASE)/dsdl_generated

dsdl_install:
	git submodule sync --recursive
	git submodule update --init --recursive --depth 3

dsdl_gen: dsdl_install
	python3 $(TP_BASE)/dronecan_dsdlc/dronecan_dsdlc.py \
		-O $(GEN_DIR) \
		$(TP_BASE)/DSDL/uavcan \
		$(TP_BASE)/DSDL/dronecan

clean:
	rm -rf build
	rm -rf $(TP_BASE)/libcanard $(TP_BASE)/DSDL $(TP_BASE)/dronecan_dsdlc $(GEN_DIR)

clean_modules:  # we also have BLDC-Motor-Driver as a submodule, that we don't want to delete, so we only clean the submodules that are in the firmware folder
	git submodule deinit -f --all
	rm -rf .git/modules/$(CURRENT_DIRNAME)/$(TP_BASE)/libcanard
	rm -rf .git/modules/$(CURRENT_DIRNAME)/$(TP_BASE)/DSDL
	rm -rf .git/modules/$(CURRENT_DIRNAME)/$(TP_BASE)/dronecan_dsdlc

.PHONY: clean clean_modules dsdl_gen dsdl_install bin_create flash  
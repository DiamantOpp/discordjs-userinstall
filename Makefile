# This Makefile will only function on UNIX systems, and some UNIX-like systems (such as MacOS and FreeBSD). To compile for w*ndows, check README.md.

SRC=src
DIST=dist
NODE=node
MAIN=Index
PM=npm
TSC=tsc
CFLAGS=--target ES2021 --module commonjs

SOURCE:=$(shell find $(SRC) -type f -name '*.ts')
OBJECTS:=$(patsubst $(SRC)/%.ts,$(DIST)/%.js,$(SOURCE))

$(DIST)/%.js: $(SRC)/%.ts
	@mkdir -pv $(DIST) $(dir $@)
	@$(TSC) $< --outDir $(dir $@) $(CFLAGS)

.PHONY: i run clean fclean cclean

run: i cclean $(OBJECTS)
	@[ -f $(DIST)/$(MAIN).js ] && $(NODE) $(DIST)/$(MAIN).js || $(NODE) .
	
i:
	@$(PM) i

clean:
	rm -rf $(DIST)

fclean: clean
	rm -rf node_modules/

cclean:
	@if [ -d $(DIST) ]; then [ -d $(DIST)/commands ] && rm -rf $(DIST)/commands/*; fi
# Makefile for the imjs project
#
# Version 1.0
# Alex Kalderimis
# Thu Feb 14 16:29:54 GMT 2013

TASK = default
REPORTER = spec

export PATH := $(shell find node_modules -name 'bin' -printf %p:)node_modules/.bin:${PATH}

test:
	grunt test

run:
	grunt $(TASK)

test-cov: instrument
	mkdir -p coverage
	IMJS_COV=1 mocha --reporter html-cov test/mocha/*.coffee > coverage/coverage.html; exit 0
	@echo Coverage report generated in coverage/coverage.html

xunit: build
	bower install
	bower install mocha expect
	grunt build-acceptance-index
	mkdir -p test/results
	mocha --reporter xunit test/mocha/*.coffee > test/results/node.xml
	mocha-phantomjs test/browser/index.html -R xunit > test/results/browser.xml
	@echo Generated test reports in test/results

build:
	grunt build

instrument: build
	@echo Instrumenting source code.
	@jscoverage --no-highlight build build-cov

docs:
	codo -n imjs src

browser-deps:
	bower install

build-static-acceptance:
	grunt build-static-acceptance-index

build-acceptance-test: browser-deps build
	grunt build-acceptance-index

clean:
	rm -rf test/results
	rm -rf build-cov
	rm -rf build
	rm -rf doc
	rm -f coverage.html

jenkins: clean xunit test-cov docs build-static-acceptance


.PHONY: test
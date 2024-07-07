.PHONY:all
all:build test log

.PHONY:build
build:
	npm install

.PHONY:test
test:
	npx playwright test

.PHONY:show-report
show-report:
	npx allure generate allure-results -o allure-report --clean
	npx allure open allure-report

.PHONY:clear-report
clear-report:
	rm -rf allure-re*
	rm -rf playwright-report
	rm -rf results.*
.PHONY:clean
clean:clear-report
	rm -rf node_modules
	rm -rf test-results
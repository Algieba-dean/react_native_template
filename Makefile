.PHONY: help setup check format format-check lint typecheck test test-coverage test-e2e e2e-studio clean run-ios run-android start

help:
	@echo "Available commands:"
	@echo "  make setup          - Install dependencies"
	@echo "  make start          - Start React Native Metro bundler"
	@echo "  make check          - Run all quality gates (lint, format:check, typecheck, test)"
	@echo "  make format         - Format code with Prettier"
	@echo "  make lint           - Run ESLint"
	@echo "  make typecheck      - Run TypeScript type checks"
	@echo "  make test           - Run Jest test suite"
	@echo "  make test-coverage  - Run Jest test suite with coverage report"
	@echo "  make test-e2e       - Run Maestro E2E test suite"
	@echo "  make e2e-studio     - Launch Maestro Studio visual inspector"
	@echo "  make clean          - Clean build artifacts and node_modules"
	@echo "  make run-ios        - Run application on iOS simulator"
	@echo "  make run-android    - Run application on Android emulator/device"

setup:
	npm install

start:
	npm start

check: lint format-check typecheck test

format:
	npm run format

format-check:
	npm run format:check

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm test

test-coverage:
	npm run test:coverage

test-e2e:
	npm run test:e2e

e2e-studio:
	npm run test:e2e:studio

clean:
	npm run clean

run-ios:
	npm run ios

run-android:
	npm run android

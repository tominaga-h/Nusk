.PHONY: dev build generate

dev:
	cd apps/web && bunx nuxt dev

build:
	cd apps/web && bunx nuxt build

generate:
	cd apps/web && bunx nuxt generate

# ppal-api

Core de negocio: la API que expone las reglas del dominio.

Forma parte del proyecto **PantryPal** (`ppal`) — Ingeniería para el Desarrollo Móvil (posgrado) · CORHUILA 2026-B.

| | |
|---|---|
| Rol | Core de negocio (API) |
| Contenerizado | Sí: se entrega con su `Dockerfile`. |
| Gobierno y documentación | [`ppal-docs`](https://github.com/code-corhuila/ppal-docs) |
| Backlog | GitHub Project `ppal-backlog` |

## Ramas

| Rama | Uso |
|---|---|
| `develop` | Integración (rama por defecto) |
| `qa` | Pruebas |
| `main` | Producción |

**Todo cambio a `develop`, `qa` o `main` entra por pull request.** Ninguna de las tres admite
commits directos, force-push ni borrado (tampoco para administradores).

1. Trabajo diario: rama `feat/<tema>` o `fix/<tema>` desde `develop` → PR a `develop`.
2. Promoción: PR `develop` → `qa` y PR `qa` → `main`.
3. El PR a `main` necesita la aprobación del docente. La rama de trabajo se borra al fusionar.

## Repositorios del proyecto

| Repositorio | Rol |
|---|---|
| [`ppal-docs`](https://github.com/code-corhuila/ppal-docs) | Gobierno único del proyecto |
| [`ppal-api`](https://github.com/code-corhuila/ppal-api) | Core de negocio (API) |
| [`ppal-app`](https://github.com/code-corhuila/ppal-app) | Aplicación móvil |
| [`ppal-portal`](https://github.com/code-corhuila/ppal-portal) | Portal web |
| [`ppal-db`](https://github.com/code-corhuila/ppal-db) | Migraciones de base de datos |
| [`ppal-infra`](https://github.com/code-corhuila/ppal-infra) | Infraestructura y orquestación |
| [`ppal-tools`](https://github.com/code-corhuila/ppal-tools) | Paquete de herramientas |

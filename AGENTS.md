# AGENTS.md

## Repository

GeoPortia is a Backstage monorepo for Eskilstuna's geodata catalog. It contains:

- `packages/app`: Backstage frontend.
- `packages/backend`: Backstage backend assembly.
- `plugins/*`: internal frontend plugins, backend modules, and shared libraries.
- `examples/`: catalog entities and scaffolder templates.
- `docs/`: MkDocs documentation.
- `docker-compose.yml`: local PostGIS, GeoServer, and ArcGIS SDE proxy.
- `docker-compose-eskilstuna.yml`: local PostGIS and GeoServer setup.

Node 20 or 22 and Yarn 4.4.1 are required. The repository pin is
`packageManager: yarn@4.4.1`.

## Workspace model

The root Yarn workspace includes `packages/*` and `plugins/*`.

- Use package-local scripts for package work:
  `yarn workspace <package-name> <script>`.
- Use root scripts for repository-wide work.
- Backend plugin modules are registered in `packages/backend/src/index.ts`.
- Frontend routes and plugin registration are in `packages/app/src/App.tsx`.
- Backend configuration is in `app-config.yaml`; production overrides are in
  `app-config.production.yaml`.
- Local environment overrides belong in ignored `app-config.local.yaml` files.
- Backend `.env` files belong in `packages/backend/.env` and must never be
  committed.

## Internal package conventions

Prefer the names and versions declared in each package manifest. Several shared
packages use both a canonical `@internal/backstage-plugin-*` name and a legacy
alias such as `@internal/fmeflow-common`. When changing these dependencies:

1. Update the manifest and all source imports consistently.
2. Update `yarn.lock` through Yarn rather than editing it manually.
3. Verify the matching workspace entry and exported symbols.
4. Do not rename an exported package without updating every consumer.

Do not self-declare a package as its own dependency (`file:` entries may exist
in generated or older manifests, but they should not be copied into new work).

## Setup and common commands

Install dependencies from the repository root:

```powershell
corepack yarn install
```

The local development stack:

```powershell
docker compose -f docker-compose.yml up -d --build
corepack yarn dev
```

Use `docker-compose-eskilstuna.yml` instead when ArcGIS SDE is supplied externally.

Common checks:

```powershell
corepack yarn tsc
corepack yarn lint:all
corepack yarn test
corepack yarn build:all
corepack yarn prettier:check
corepack yarn test:e2e
```

For package-specific work, use the package script:

```powershell
corepack yarn workspace <package-name> build
corepack yarn workspace <package-name> lint
corepack yarn workspace <package-name> test
```

The metadata OpenAPI code is generated. If its schema or API contract changes,
run the plugin's `generate` script instead of manually editing files under
`plugins/geoportia-metadata*/src/schema/openapi/generated/`.

## Environment variables

The backend `.env` and configuration reference the following integrations:

- GitHub: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, optionally `GITHUB_TOKEN`
  or an Enterprise integration token.
- PostgreSQL: `POSTGRES_URI` locally, or `POSTGRES_HOST`, `POSTGRES_PORT`,
  `POSTGRES_USER`, `POSTGRES_PASSWORD` in production.
- FME Flow: `FMEFLOW_BASE_URL`, `FMEFLOW_TOKEN`, `FME_REPOSITORY_NAME`.
- GeoServer: `GEOSERVER_BASE_URL`, `GEOSERVER_USERNAME`,
  `GEOSERVER_PASSWORD`.
- ArcGIS SDE proxy: `ARCPY_URI`, `ARCPY_ADMIN_USER`,
  `ARCPY_ADMIN_PASSWORD`, `ARCPY_DATABASE`.
- Optional Backstage service authentication: `BACKEND_SECRET`.

Do not add real credentials to `app-config.yaml`, package manifests, tests,
documentation or commits.

## Testing

Use existing Backstage Jest conventions and keep tests close to the package:

- Frontend package tests: `packages/app/src/**/*.test.tsx`.
- E2E tests: `packages/app/e2e-tests/**/*.ts`.
- Plugin tests: `plugins/*/src/**/*.test.ts` or `*.test.tsx`.

For focused changes, run the affected package's `test`, `lint`, and `build`
scripts before the repository-wide equivalent. Add tests for behavior introduced
or fixed; do not create snapshots or tests that only restate implementation
details.

E2E tests start `yarn dev` when `CI` is unset and expect the app at port 3000.
Playwright output belongs in ignored `e2e-test-report/`.

## Source conventions

- Follow existing Backstage 2.x/new backend-system patterns.
- Frontend code uses React 18 and MUI 4/5-compatible components already declared
  in each package.
- Backend code uses the backend plugin API and catalog provider/processor APIs.
- Shared catalog entity kinds are declared through common packages and catalog
  processor/provider modules.
- Swedish user-facing strings belong in the existing translation resources under
  `packages/app/src/translations/`.
- Use `process.env`/Backstage config for deployment-specific values; do not add
  environment-specific URLs or credentials in source.
- Preserve existing TODOs unless the task explicitly resolves them.

## Generated and ignored files

Do not commit or manually edit:

- `node_modules/`
- `dist/` and `dist-types/`
- `.yarn/*` except the pinned Yarn release.
- `coverage/`
- `site/`
- `e2e-test-report/`
- `packages/backend/database/`
- generated OpenAPI directories under metadata plugins
- `.env`, `app-config.local.yaml`, and credential files

When a build or generator changes ignored output, verify source diffs only.

## Working-tree boundaries

Before editing, inspect `git status` and preserve unrelated local changes.
Current local modifications and untracked files may belong to separate work:

- `plugins/geodataset-management/package.json`
- `yarn.lock`
- files under `plugins/catalog-backend-module-arcgis-sde-data/src/sde-python-proxy/`

Do not revert, delete, or rewrite these files unless the task explicitly requires
it. For new changes, use the smallest package or source area that addresses the
request and validate adjacent registration/configuration surfaces.

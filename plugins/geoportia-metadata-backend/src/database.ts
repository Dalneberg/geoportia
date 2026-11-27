// I branch dev körs migrations parallellt från de tre modulerna: module.ts, plugin.ts, scaffolder-module.ts
// Det gav ett fel vid uppstart med yarn dev:
// MigrationLocked: Module 'geoportia-metadata-provider' for plugin 'catalog' startup failed; caused by MigrationLocked: update knex_migrations_lock set is_locked = 1 where is_locked = 0 - database is locked
// backend: cause: MigrationLocked: update knex_migrations_lock set is_locked = 1 where is_locked = 0 - database is locked

// För att åtärda det felet körs nu endast en gemensam migrationsrunda inom backend-processen,
// och migrationerna hanterar saknade tabeller eller kolumner idempotent 
// En idempotent operation ger samma resultat oavsett hur många gånger den utförs efter den första körningen
import { resolvePackagePath } from '@backstage/backend-plugin-api';
import type { Knex } from 'knex';

interface MigrationDatabase {
  migrations?: {
    skip?: boolean;
  };
  getClient: () => Promise<Knex>;
}

let migrationsPromise: Promise<void> | undefined;

export async function ensureGeoPortiaMetadataMigrations(
  database: MigrationDatabase,
): Promise<void> {
  if (database.migrations?.skip) {
    return;
  }

  if (!migrationsPromise) {
    migrationsPromise = (async () => {
      const client = await database.getClient();
      await client.migrate.latest({
        directory: resolvePackagePath(
          '@internal/backstage-plugin-geoportia-metadata-backend',
          'migrations',
        ),
      });
    })().catch(error => {
      migrationsPromise = undefined;
      throw error;
    });
  }

  await migrationsPromise;
}

export interface TableRow {
  id: number;
  entity_ref: string;
  schema: unknown;
  metadata: unknown;
  deleted: boolean;
}

export interface SuggestionTableRow {
  id: number;
  metadata_id: number;
  metadata: unknown;
  created_at: Date;
  suggested_by: string;
}
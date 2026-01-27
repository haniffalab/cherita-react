// eslint-disable-line
import * as duckdb from '@duckdb/duckdb-wasm';
// eslint-disable-next-line import/no-unresolved
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
// eslint-disable-next-line import/no-unresolved
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
// eslint-disable-next-line import/no-unresolved
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
// eslint-disable-next-line import/no-unresolved
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import { useQuery } from '@tanstack/react-query';

const duckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

let dbInstance = null;

const initDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  const bundle = await duckdb.selectBundle(duckDBBundles);
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  dbInstance = db;
  return db;
};

export const useParquet = () => {
  return useQuery({
    queryKey: ['duckdb-instance'],
    queryFn: initDB,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useParquetQuery = (queryString, options) => {
  const { data: db, isLoading: isDbLoading } = useParquet();

  return useQuery({
    queryKey: ['duckdb-query', queryString],
    queryFn: async () => {
      const c = await db.connect();
      await c.query('LOAD httpfs;');
      const result = await c.query(queryString);
      await c.close();
      return result;
      // return result.toArray().map((row) => row.toJSON());
    },
    enabled:
      !isDbLoading && !!db && !!queryString && (options?.enabled ?? true),
    ...options,
  });
};

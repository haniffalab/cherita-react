import * as duckdb from '@duckdb/duckdb-wasm';
import { useQuery } from '@tanstack/react-query';

let dbInstance = null;

const initDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: 'text/javascript',
    }),
  );
  const worker = new Worker(worker_url);

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
    },
    enabled:
      !isDbLoading && !!db && !!queryString && (options?.enabled ?? true),
    ...options,
  });
};

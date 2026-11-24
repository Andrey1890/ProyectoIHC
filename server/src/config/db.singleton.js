const {
  SupabaseDatabaseSingleton,
  getSupabaseSingleton
} = require("./supabase.singleton");

module.exports = {
  DatabaseSingleton: SupabaseDatabaseSingleton,
  SupabaseDatabaseSingleton,
  getDbSingleton: getSupabaseSingleton,
  getSupabaseSingleton
};

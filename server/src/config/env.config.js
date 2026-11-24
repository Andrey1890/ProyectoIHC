const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  quiet: true
});

const rawCorsOrigin = process.env.CORS_ORIGIN || "*";
const parsedCorsOrigins = rawCorsOrigin
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const dbHost = process.env.SUPABASE_HOST || "aws-1-us-west-2.pooler.supabase.com";
const dbPort = Number.parseInt(process.env.SUPABASE_PORT || "5432", 10);
const dbName = process.env.SUPABASE_DB || "postgres";
const dbUser = process.env.SUPABASE_USER || "postgres.jdsqipqdcuyegjrpvgny";
const dbPass = (process.env.SUPABASE_PASSWORD || "").trim();
const fallbackDatabaseUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPass)}@${dbHost}:${dbPort}/${dbName}?sslmode=require&pgbouncer=true`;

const ENV = Object.freeze({
  PORT: Number.parseInt(process.env.PORT || "4050", 10),
  CLIENT_PORT: Number.parseInt(process.env.CLIENT_PORT || "4051", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: rawCorsOrigin,
  CORS_ORIGINS: Object.freeze(parsedCorsOrigins),
  CORS_METHODS: (process.env.CORS_METHODS || "GET,POST,PUT,PATCH,DELETE").trim(),
  PAGINATION_LIMIT: Number.parseInt(process.env.PAGINATION_LIMIT || "100", 10),
  HASH_SECRET_SALT: (process.env.HASH_SECRET_SALT || "clave_secreta_para_hashes_2026").trim(),
  JWT_SECRET: (process.env.JWT_SECRET || process.env.HASH_SECRET_SALT || "jwt_secreto_dermakor_2026").trim(),
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || "8h").trim(),
  API_PREFIX: (process.env.API_PREFIX || "/api/v1").trim(),
  DATABASE_URL: (process.env.DATABASE_URL || fallbackDatabaseUrl).trim(),
  SUPABASE: Object.freeze({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPass,
    restUrl: (process.env.SUPABASE_REST_URL || "https://jdsqipqdcuyegjrpvgny.supabase.co/rest/v1").replace(/\/+$/, ""),
    anonKey: (process.env.SUPABASE_ANON_KEY || "").trim()
  })
});

module.exports = ENV;

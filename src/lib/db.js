import { createClient } from '@libsql/client/web';

// Initialize Turso client using Vite environment variables
// IMPORTANT: For a production app, the database connection should be handled by a backend
// for security reasons, so the auth token is not exposed in the frontend.
// However, since we are doing purely client-side PWA right now, we use the web client with caution.
const url = import.meta.env.VITE_TURSO_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

export const db = url ? createClient({ url, authToken }) : null;

// Initialize tables if they don't exist
export async function initDb() {
  if (!db) {
    console.warn("Turso DB not configured. Using local fallback.");
    return false;
  }
  
  try {
    // Wardrobe table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wardrobe (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        subcategory TEXT,
        colors TEXT,
        pattern TEXT,
        season TEXT,
        occasion TEXT,
        image TEXT,
        brand TEXT,
        wearCount INTEGER DEFAULT 0,
        lastWorn TEXT,
        createdAt TEXT
      )
    `);

    // Outfits table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS outfits (
        id TEXT PRIMARY KEY,
        name TEXT,
        items TEXT,
        rating INTEGER DEFAULT 0,
        wornCount INTEGER DEFAULT 0,
        lastWorn TEXT,
        aiScore INTEGER DEFAULT 0
      )
    `);

    return true;
  } catch (error) {
    console.error("Failed to initialize Turso DB:", error);
    return false;
  }
}

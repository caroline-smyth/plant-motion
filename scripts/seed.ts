import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "@vercel/postgres";

async function seed() {
  await sql`
    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      image TEXT,
      painter TEXT NOT NULL,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      medium TEXT,
      notes TEXT
    )
  `;

  await sql`DELETE FROM cards`;

  await sql`
    INSERT INTO cards (image, painter, title, year, medium, notes) VALUES
    ('/m_vert.jpg', 'Morisot', 'The Cradle', 1872, 'Oil on canvas', 'Relationship between mother and child is ambiguous and not Madonna-like; modern representation of motherhood'),
    ('/tuileries.jpg', 'Manet', 'Music in the Tuileries', 1862, 'Oil on canvas', 'Main point I remember is that the ladies in yellow are probably courtesans'),
    ('/repin.jpg', 'Repin', 'Parisian Cafe', 1875, 'Oil on canvas', 'Depiction of Parisian life by Russian - can''t get too Impressionist although the subject is French')
  `;

  console.log("Seeded cards table successfully");
}

seed().catch(console.error);

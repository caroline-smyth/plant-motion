import { sql } from "@vercel/postgres";
import CardDeck from "./CardDeck";
import ThemePicker from "../../../components/ThemePicker";

export default async function CardPage() {
  const { rows } = await sql`SELECT * FROM cards ORDER BY id`;
  return <CardDeck cards={rows as any} />;
}

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load Env
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value && !process.env[key.trim()]) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
      }
    });
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from("ssdown_blogs")
    .select("category");

  if (error) {
    console.error("Error:", error);
    return;
  }

  const counts: Record<string, number> = {};
  data.forEach((row: any) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
  });

  console.log("Current Category Distribution:");
  console.table(counts);
}

check();

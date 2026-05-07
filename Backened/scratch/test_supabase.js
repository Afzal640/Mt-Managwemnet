import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

const test = async () => {
  const tables = ['users', 'leads', 'activities', 'targets', 'projects', 'files'];
  
  for (const table of tables) {
    console.log(`Testing ${table} table...`);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
      } else {
        console.log(`Successfully fetched ${table}:`, data.length, "rows");
      }
    } catch (err) {
      console.error(`Unexpected error for ${table}:`, err.message);
    }
    console.log("---");
  }
};

test();

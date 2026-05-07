import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

const inspect = async () => {
  try {
    console.log("Inspecting leads table...");
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Leads columns:", Object.keys(data[0] || {}));
      console.log("Full lead object:", data[0]);
    }
  } catch (err) {
    console.error(err);
  }
};

inspect();

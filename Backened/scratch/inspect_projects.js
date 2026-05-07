import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

const inspect = async () => {
  try {
    console.log("Inspecting projects table...");
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Projects columns:", Object.keys(data[0] || {}));
      console.log("Full project object:", data[0]);
    }
  } catch (err) {
    console.error(err);
  }
};

inspect();

import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

const find = async () => {
  try {
    console.log("Finding production users...");
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'production');

    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Production users:", data);
    }
  } catch (err) {
    console.error(err);
  }
};

find();

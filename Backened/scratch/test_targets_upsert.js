import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

const testUpsert = async () => {
  try {
    console.log("Testing targets upsert...");
    
    // Using a real user ID if possible, or just a random UUID for testing if the table allows it.
    // Actually, I should use a real user ID to avoid FK violations.
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
      console.error("No users found to test with.");
      return;
    }
    const userId = users[0].id;

    const { data, error } = await supabase
      .from('targets')
      .upsert({ 
        user_id: userId, 
        type: 'leads', 
        period: 'daily', 
        target_value: 10, 
        assigned_by: userId,
        current_value: 0
      }, {
        onConflict: 'user_id,type,period' 
      })
      .select();

    if (error) {
      console.error("Upsert Error:", error);
    } else {
      console.log("Upsert Success:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

testUpsert();

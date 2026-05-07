import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";
dotenv.config();

const check = async () => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('service, status, budget, created_at');

    if (error) {
      console.error("Error:", error);
      return;
    }

    console.log("Leads found:", leads.length);
    leads.forEach(l => {
      console.log(`- Service: ${l.service}, Status: ${l.status}, Budget: ${l.budget}, CreatedAt: ${l.created_at}`);
    });

    // Emulate chart logic
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      monthlyStats.push({ month: months[monthIdx], deals: 0, revenue: 0, monthIdx });
    }

    leads.filter(l => l.status === "closed-won").forEach(l => {
      const date = new Date(l.created_at);
      const mIdx = date.getMonth();
      console.log(`Processing closed-won lead: monthIdx=${mIdx}, date=${date}`);
      const stats = monthlyStats.find(s => s.monthIdx === mIdx);
      if (stats) {
        stats.deals += 1;
        stats.revenue += parseFloat(l.budget) || 0;
        console.log(`Updated stats for ${stats.month}: deals=${stats.deals}, revenue=${stats.revenue}`);
      } else {
        console.log(`No stats entry found for monthIdx=${mIdx}`);
      }
    });

    console.log("Final Monthly Stats:", monthlyStats);

  } catch (err) {
    console.error(err);
  }
};

check();

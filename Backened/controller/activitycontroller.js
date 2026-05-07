import { supabase } from "../config/supabaseClient.js";

// ✅ GET ALL ACTIVITIES
export const getActivities = async (req, res) => {
  try {
    const user = req.user;
    
    // Query start karein aur 'createdBy' user ka naam join karein
    let query = supabase
      .from('activities')
      .select(`
        *,
        createdBy:users!activities_created_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    // Role-based filtering
    if (user.role !== "admin") {
      query = query.eq('created_by', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error fetching activities" });
  }
};

// ✅ CREATE ACTIVITY
export const createActivity = async (req, res) => {
  try {
    const user = req.user;
    
    // 1. Activity data prepare karein (SQL snake_case columns ke mutabiq)
    const activityData = {
      type: req.body.type,
      client_name: req.body.clientName,
      company: req.body.company,
      date: req.body.date,
      time: req.body.time,
      notes: req.body.notes,
      outcome: req.body.outcome,
      created_by: user.id
    };

    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single();

    if (activityError) throw activityError;

    // 2. 🔥 AUTOMATIC TARGET UPDATE
    if (user.role === "sales") {
      let targetType = "followups";
      if (activity.type === "call") targetType = "calls";
      if (activity.type === "meeting") targetType = "meetings";

      // SQL Upsert Logic: Pehle check karein record hai ya nahi
      const { data: existingTarget } = await supabase
        .from('targets')
        .select('*')
        .match({ user_id: user.id, period: 'daily', type: targetType })
        .single();

      if (existingTarget) {
        // Agar hai to increment karein
        await supabase
          .from('targets')
          .update({ current_value: (existingTarget.current_value || 0) + 1 })
          .eq('id', existingTarget.id);
      } else {
        // Agar nahi hai to naya insert karein (Upsert)
        await supabase
          .from('targets')
          .insert([{
            user_id: user.id,
            period: "daily",
            type: targetType,
            target_value: 10,
            current_value: 1
          }]);
      }
    }

    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creating activity" });
  }
};
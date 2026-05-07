import { supabase } from "../config/supabaseClient.js";

/**
 * 🎯 ASSIGN TARGET (ADMIN ONLY)
 */
export const assignTarget = async (req, res) => {
  try {
    const { userId, type, period, target } = req.body;

    // Supabase Upsert: Agar user_id, type, aur period ka combination mil jaye toh update, warna insert.
    // Note: Iske liye database mein 'unique constraint' hona zaroori hai in teeno columns par.
    const { data, error } = await supabase
      .from('targets')
      .upsert({ 
        user_id: userId, 
        type: type, 
        period: period, 
        target_value: target, 
        assigned_by: req.user.id,
        current_value: 0 // Reset progress
      }, {
        onConflict: 'user_id,type,period' 
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Assign target error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📊 GET ALL TARGETS (ADMIN + USER)
 */
export const getTargets = async (req, res) => {
  try {
    let query = supabase
      .from('targets')
      .select(`
        *,
        userId:users!targets_user_id_fkey(name, email, role)
      `)
      .order('created_at', { ascending: false });

    // admin sees all, others see only theirs
    if (req.user.role !== "admin") {
      query = query.eq('user_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Get targets error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔥 AUTO UPDATE PROGRESS
 */
export const updateTargetProgress = async (req, res) => {
  try {
    const { userId, type, increment = 1 } = req.body;

    // Postgres mein direct increment ke liye pehle fetch karna parta hai ya RPC use hota hai.
    // Simple way: Fetch current value then update.
    const { data: targetData, error: fetchError } = await supabase
      .from('targets')
      .select('id, current_value')
      .match({ user_id: userId, type: type })
      .single();

    if (fetchError || !targetData) throw new Error("Target not found");

    const { data: updated, error: updateError } = await supabase
      .from('targets')
      .update({ current_value: (targetData.current_value || 0) + increment })
      .eq('id', targetData.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ success: true, updated });
  } catch (error) {
    console.error("Update target progress error:", error);
    res.status(500).json({ message: error.message });
  }
};
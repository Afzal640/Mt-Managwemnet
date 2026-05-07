import { supabase } from "../config/supabaseClient.js";

export const getSalesDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Leads Count (Assigned to this user)
    const { count: leadsCount, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId);

    if (leadsError) throw leadsError;

    // 2. Total Deals Count (Closed-won)
    const { count: dealsCount, error: dealsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('status', 'closed-won');

    if (dealsError) throw dealsError;

    // 3. Dynamic Followups Count (Activities of type 'call' or 'message')
    const { count: followupsCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .in('type', ['call', 'message']);

    // 4. Recent Activities (Limit 5)
    const { data: recentActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (activitiesError) throw activitiesError;

    // 5. Final Response
    res.json({
      stats: {
        leads: leadsCount || 0,
        deals: dealsCount || 0,
        followups: followupsCount || 0
      },
      chart: [
        { month: "Jan", deals: 2 },
        { month: "Feb", deals: 4 }
        // Note: Chart data ko dynamic banane ke liye aggregation query lagti hai, 
        // abhi ke liye maine wahi rakha hai jo aapke purane code mein tha.
      ],
      recentActivities: recentActivities || []
    });

  } catch (err) {
    console.error("🔥 Dashboard error:", err);
    res.status(500).json({ msg: "Error fetching dashboard data" });
  }
};
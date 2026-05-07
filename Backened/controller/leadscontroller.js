import { supabase } from "../config/supabaseClient.js";

// ✅ GET LEADS (Converted)
export const getLeads = async (req, res) => {
  try {
    const user = req.user;
    // SQL mein hum select ke andar foreign keys ko specify karte hain (Populate jaisa result lene ke liye)
    let query = supabase
      .from('leads')
      .select(`
        *,
        createdBy:users!leads_created_by_fkey(id, name, email),
        assignedTo:users!leads_assigned_to_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false });

    // Role-based filtering
    if (user.role === "sales") {
      query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
    } else if (user.role !== "admin") {
      return res.json([]);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE LEAD (Converted)
export const createLead = async (req, res) => {
  try {
    const user = req.user;
    const leadData = {
      client_name: req.body.clientName, // SQL columns lowercase/underscore hote hain
      contact_person: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      service: req.body.service,
      budget: req.body.budget,
      status: req.body.status || 'new',
      created_by: user.id,
      assigned_to: user.role === "sales" ? user.id : req.body.assignedTo
    };

    // 1. Insert Lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (leadError) throw leadError;

    // 2. Auto-log Activity
    await supabase.from('activities').insert([{
      type: "message",
      client_name: lead.client_name,
      notes: `New lead added by ${user.name || "team"}.`,
      outcome: "Lead Created",
      created_by: user.id
    }]);

    // 3. Update Target Progress (Sales Only)
    if (user.role === "sales") {
      // Note: SQL mein 'upsert' ke liye logic thora change hota hai
      // Hum pehle check karenge ke target exist karta hai ya nahi
      const { data: target } = await supabase
        .from('targets')
        .select('*')
        .match({ user_id: user.id, period: 'daily', type: 'leads' })
        .single();

      if (target) {
        await supabase
          .from('targets')
          .update({ current_value: target.current_value + 1 })
          .match({ id: target.id });
      } else {
        await supabase.from('targets').insert([{
          user_id: user.id,
          period: 'daily',
          type: 'leads',
          target_value: 10,
          current_value: 1
        }]);
      }
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE LEAD (Converted)
export const deleteLead = async (req, res) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE LEAD (Converted)
export const updateLead = async (req, res) => {
  try {
    const { 
      clientName, 
      contactPerson, 
      email, 
      phone, 
      service, 
      budget, 
      status, 
      assignedTo,
      notes,
      source,
      deadline
    } = req.body;

    const updateData = {};
    if (clientName) updateData.client_name = clientName;
    if (contactPerson) updateData.contact_person = contactPerson;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (service) updateData.service = service;
    if (budget) updateData.budget = budget;
    if (status) updateData.status = status;
    if (assignedTo) updateData.assigned_to = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    if (source) updateData.source = source;
    if (deadline !== undefined) updateData.deadline = deadline;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
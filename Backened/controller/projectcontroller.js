import { supabase } from "../config/supabaseClient.js";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";

// ✅ CREATE PROJECT FROM LEAD
export const createProjectFromLead = async (req, res) => {
  try {
    const { leadId, assignedTo, service, deadline } = req.body;

    // 1. Lead ka data lein
    const { data: lead, error: leadFetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadFetchError || !lead) return res.status(404).json({ message: "Lead not found" });

    // 1b. Lead ke files fetch karein
    const { data: leadFiles } = await supabase
      .from('files')
      .select('name, url, size, uploaded_by')
      .eq('lead_id', leadId);

    // Format files for projects table (JSONB array)
    const formattedFiles = (leadFiles || []).map(f => ({
      name: f.name,
      url: f.url,
      size: f.size,
      uploaded_by: f.uploaded_by,
      created_at: new Date()
    }));

    // 2. Project create karein
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        client_name: lead.client_name,
        service: service || lead.service,
        assigned_to: assignedTo,
        deadline: deadline || lead.deadline || null,
        created_by: req.user.id,
        status: "not-started",
        progress: 0,
        notes: lead.notes, // Copy notes
        files: formattedFiles // Copy files
      }])
      .select()
      .single();

    if (projectError) throw projectError;

    // 3. Lead ka status update karein "closed-won"
    await supabase
      .from('leads')
      .update({ status: 'closed-won' })
      .eq('id', leadId);

    res.status(201).json({
      message: "Lead successfully converted to project",
      project: {
        ...project,
        clientName: project.client_name,
        _id: project.id
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL PROJECTS
export const getProjects = async (req, res) => {
  try {
    const user = req.user;
    let query = supabase
      .from('projects')
      .select(`
        *,
        assignedTo:users!projects_assigned_to_fkey(name),
        createdBy:users!projects_created_by_fkey(name)
      `);

    if (user.role !== "admin") {
      query = query.eq('assigned_to', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map snake_case to camelCase for frontend compatibility
    const mappedData = data.map(p => ({
      ...p,
      clientName: p.client_name,
      _id: p.id // Also add _id for compatibility
    }));

    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PROJECT STATUS
export const updateProjectStatus = async (req, res) => {
  try {
    const { status, progress } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update({ 
        status: status, 
        progress: progress 
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Map snake_case to camelCase
    res.json({
      ...data,
      clientName: data.client_name,
      _id: data.id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADD PROJECT FILE (Simplified for now)
export const addProjectFile = async (req, res) => {
  try {
    const { url } = req.body;
    
    // SQL mein Array column (files) update karne ka tareeka
    // Pehle current files fetch karein phir append karein
    const { data: project } = await supabase
      .from('projects')
      .select('files')
      .eq('id', req.params.id)
      .single();

    const newFile = { url, uploaded_by: req.user.name, created_at: new Date() };
    const updatedFiles = project.files ? [...project.files, newFile] : [newFile];

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({ files: updatedFiles })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const handleProjectFileUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    // 1. Supabase Storage mein upload karein aur URL lein
    const fileUrl = await uploadToSupabase(req.file);

    // 2. Is URL ko database mein project ke andar save karein
    const { data: project } = await supabase
      .from('projects')
      .select('files')
      .eq('id', req.params.id)
      .single();

    const newFile = { 
        url: fileUrl, 
        uploaded_by: req.user.name, 
        name: req.file.originalname, // File ka asli naam
        created_at: new Date() 
    };
    
    const updatedFiles = project.files ? [...project.files, newFile] : [newFile];

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({ files: updatedFiles })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { clientName, service, assignedTo, deadline } = req.body;
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        client_name: clientName,
        service,
        assigned_to: assignedTo,
        deadline,
        created_by: req.user.id,
        status: "not-started",
        progress: 0
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({
      ...data,
      clientName: data.client_name,
      _id: data.id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET PROJECT BY ID
export const getProjectById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        assignedTo:users!projects_assigned_to_fkey(id, name, email),
        createdBy:users!projects_created_by_fkey(id, name, email)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Map fields for frontend compatibility
    res.json({
      ...data,
      clientName: data.client_name,
      _id: data.id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
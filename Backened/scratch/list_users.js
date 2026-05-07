import { supabase } from '../config/supabaseClient.js';

const listUsers = async () => {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role');

  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Existing users in Supabase:');
    users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: [${u.email}] | Role: ${u.role}`);
    });
  }
};

listUsers();

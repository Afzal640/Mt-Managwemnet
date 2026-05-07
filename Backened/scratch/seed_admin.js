import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const seedAdmin = async () => {
  const email = 'admin@gmail.com';
  const password = 'admin'; // You can change this
  const name = 'Admin User';
  const role = 'admin';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from('users')
    .insert([
      { name, email, password: hashedPassword, role }
    ])
    .select();

  if (error) {
    console.error('Error seeding admin user:', error);
  } else {
    console.log('Admin user created successfully:', data);
  }
};

seedAdmin();

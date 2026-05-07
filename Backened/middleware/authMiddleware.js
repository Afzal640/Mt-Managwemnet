import jwt from "jsonwebtoken";
import { supabase } from "../config/supabaseClient.js"; // Client import karna zaroori hai

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = header.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret);

    // 1. Supabase se fresh user data lein
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ msg: "User no longer exists" });
    }

    // 2. Check karein agar user inactive toh nahi (Optional)
    if (user.status === 'inactive') {
      return res.status(403).json({ msg: "Your account is deactivated" });
    }

    // 3. Normalize User Object 
    // Hum 'id' aur '_id' dono set kar dete hain taake purana aur naya code dono chalein
    req.user = {
      ...user,
      id: user.id,
      _id: user.id 
    };

    next();
  } catch (error) {
    console.log("JWT Verify Error:", error.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
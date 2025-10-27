import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

function Verified() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    };
    fetchUser();
  }, []);

  return (
    <>
    <div>
      <h2>Email Verified ✅</h2>
      {user ? <p>Welcome, {user.email}!</p> : <p>Loading user info...</p>}
    </div>
    </>

  );
}

export default Verified;
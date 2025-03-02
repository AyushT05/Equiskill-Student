"use client"
import { useUser } from '@clerk/nextjs'
import React, { useEffect } from 'react'
import { db } from './configs/db';
import { USER_TABLE } from './configs/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

 function Provider({ children }) {



    const user = useUser();
    console.log("User data:", user);
    console.log("User fullName:", user?.user?.fullName);

    useEffect(() => { //Called whenever 
        user && CheckIsNewUser();
    }, [user])

    const CheckIsNewUser = async () => {
        if (user?.user) {
          const resp = await axios.post('/api/create-user', {
            user: user.user // Send entire user object from Clerk
          });
          console.log(resp.data);
        }
      };
      
   
    
    return (
        <div>
            {children}
        </div>
    )
}

export default Provider
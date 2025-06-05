import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function CheckAuth({isAuthenticated, user, children}) {

    const location = useLocation()
    if(!isAuthenticated && !(location.pathname.includes('/login') || location.pathname.includes('/register'))  ){
        return <Navigate to ="/login"/>
    }

     if(isAuthenticated && (location.pathname.includes('/login') || location.pathname.includes('/register'))  ){
        return <Navigate to ="/project"/>
    }
   
  return <>
  {children}
  </>
  
}

export default CheckAuth

import { useEffect,useState } from "react"
import { supabase } from "../lib/supabase"

export default function useAuth(){

const [user,setUser]=useState(null)

const [loading,setLoading]=useState(true)

useEffect(()=>{

    const init=async()=>{

        const {data}=await supabase.auth.getSession()

        setUser(data.session?.user ?? null)

        setLoading(false)

    }

    init()

    const {data:{subscription}}=supabase.auth.onAuthStateChange(
    (_,session)=>{setUser(session?.user ?? null)}
    )

    return ()=>subscription.unsubscribe()

},[])

return {
user,
loading
}

}
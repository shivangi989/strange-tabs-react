import {fetchSessions}from "../services/sessionService"
import {
useEffect,
useState
}
from "react"

export default function useSessions(user){

    const [sessions,setSessions]=useState([])

    useEffect(()=>{

        if(!user) return

        load()

    },[user])

    const load=async()=>{

        const data=await fetchSessions(user.id)

        const formatted=data.map(s=>({

            id:s.id,

            title:s.title,

            date:s.created_at,

            tabCount:s.tabs?.length || 0,

            tabs:s.tabs || []

            })
        )

        setSessions(formatted)

    }

    return{
    sessions,
    setSessions,
    load
    }

}
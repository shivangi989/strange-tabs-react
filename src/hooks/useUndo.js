import { useState } from "react"

export default function useUndo(){

    const [undoInfo,setUndoInfo]= useState(null)

    return{
    undoInfo,
    setUndoInfo
    }

}
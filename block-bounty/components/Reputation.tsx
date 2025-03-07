/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'
import { useReputationNFT } from "@/lib/hooks/useReputationNFT";


  interface ReputationProps {
    id: string;
  }
const Reputation = ({id}:ReputationProps) => {
    const {getReputationOf}=useReputationNFT()
    const [reputation, setReputation]=useState<number | null>()
    useEffect(()=>{
        const fetchReputation=async()=>{
            const res=await getReputationOf(id)
            
            console.log(res)
            setReputation(res)
        }
        if(id){
            console.log(id)
            fetchReputation()
        }
    },[])
    if(!reputation) return <>Loading</>
  return (
    <div>Reputation: {reputation}</div>
  )
}

export default Reputation
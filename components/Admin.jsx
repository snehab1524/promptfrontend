import React, { useState } from 'react'
import axios from "axios"
import { API_BASE_URL } from "../api"
const Admin = () => {

    const [title,setTitle]=useState("");
    const [video,setVideo]=useState("");
    const reset=()=>{
        setTitle("");
        setVideo("");
    }
    const handelvideoupload=async(e)=>{
        e.preventDefault();
        try{
        const newdata={title,video}
        await axios.post(`${API_BASE_URL}/store-video`,newdata)
        reset();
        alert("video upload successfully");
        }catch(err){
            alert("video upload failed");
        }
    }
  return (
    <div style={{display:"flex",width:"100vw",height:"100vh",justifyContent:"center"}}>
    <div style={{borderRadius:"20px",gap:"1vw",marginTop:"15vw",display:"flex",flexDirection:"column", background:"black", width:"max-content",height:"max-content"}} >
        <form style={{margin:"2vw",display:"flex",flexDirection:"column",gap:"1.5vw"}}  onSubmit={handelvideoupload}>
        <h3 style={{fontSize:"3vw",color:"white"}}>Video upload</h3>
        <label style={{color:"white"}}>Title</label>
        <input style={{height:"2vw",width:"30vw"}} type='text' required placeholder='Title'value={title} onChange={(e)=>setTitle(e.target.value)}  />
        <label style={{color:"white"}}>Video src</label>
        <input type='text' style={{height:"2vw",width:"30vw"}}  required placeholder='video src' value={video} onChange={(e)=>setVideo(e.target.value)} />
        <button style={{color:"white", background:"blueviolet",height:"3vw",width:'30vw',borderRadius:"20px"}} type='submit'>Upload</button>
    </form>
    </div></div>
  )
}

export default Admin

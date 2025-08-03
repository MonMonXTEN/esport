'use client'
import { useRouter } from "next/navigation";


export default function LogoSidebar() {
  const router = useRouter()
  return (
    <div className="flex justify-center items-center">
      <div className="select-none uppercase bg-linear-65 from-[#f12711] to-[#f5af19] bg-clip-text text-xl font-extrabold text-transparent cursor-pointer" onClick={()=> router.push("/")}>
        Sci-tech Esport
      </div>
    </div>
  )
}
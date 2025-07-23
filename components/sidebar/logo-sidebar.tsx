import Link from "next/link";

export default function LogoSidebar() {
  return (
    <div className="flex justify-center items-center">
      <div className="select-none uppercase bg-linear-65 from-[#f12711] to-[#f5af19] bg-clip-text text-xl font-extrabold text-transparent">
        <Link href="./">Sci-tech Esport</Link>
      </div>
    </div>
  )
}
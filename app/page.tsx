import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF5F9] text-[#480A23] flex flex-col items-center justify-center">
      <Image
  src="/logo.png.png"
  alt="SkinMonitor logo"
  width={300}
  height={300}
/>
<h1 className="text-5xl font-semibold tracking-tight -translate-y-8">
  SkinMonitor</h1>

      <p className="mt-3 text-xl text-[#9C526F] -translate-y-4">
        Understand. Track. Monitor.</p>

      <p>
        A personal tool for mapping and monitoring changes in moles.
      </p>

      <Link
  href="/login"
  className="mt-8 rounded-full bg-[#9C526F] px-10 py-4 text-lg font-medium text-white transition hover:bg-[#480A23]"
>
  Get Started
</Link>
    </main>
  );
}

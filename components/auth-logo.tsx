import Image from "next/image";
import Link from "next/link";

export function AuthLogo() {
  return (
    <Link href="/" className="flex w-full justify-center">
      <Image
        src="/logo-text-blue.png"
        alt="Dentario"
        width={200}
        height={159}
        className="h-auto w-[80px]"
        priority
      />
    </Link>
  );
}

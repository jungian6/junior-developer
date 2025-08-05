import Image from "next/image";
import { Phone } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-background border-b border-foreground/10 px-6 py-4 flex-shrink-0 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src="/navbar_logo.png"
          alt="Citizens Advice SORT"
          width={40}
          height={40}
          priority
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-foreground">
            Citizens Advice SORT
          </h1>
          <h2 className="text-sm font-medium text-foreground/80">
            Junior Developer Practical
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="text-muted-foreground h-4 w-4" />
        <p className="text-sm text-muted-foreground">
          Adviceline (England): 0800 144 8848
        </p> 
      </div> 
    </nav>
  );
}
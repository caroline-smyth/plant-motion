import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function Header() {
    return (
        <div className="fixed top-6 left-6">
            <Link href="/" className="flex items-center">../</Link>
            </div>
    );
}

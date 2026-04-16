import Link from "next/link";

export default function Header() {
    return (
        <div className="fixed top-6 left-6 right-6 flex justify-between items-center">
            <Link href="/">../</Link>
        </div>
    );
}

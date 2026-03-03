import Link from "next/link";

export default function Resources() {
    return (
        <div>
            <p className="text-2xl">Resources</p>
            <ul>
                <li>
                    <Link href="https://component.gallery/components/">Components gallery</Link>
                </li>
                <li>
                    <Link href="https://blog.maximeheckel.com/">Maxime Heckel's blog</Link>
                </li>
                <li>
                    <Link href="https://www.navbar.gallery/">navbar.gallery</Link>
                </li>
            </ul>
        </div>
    );
}
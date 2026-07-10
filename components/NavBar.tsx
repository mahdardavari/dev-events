import Link from "next/link";
import Image from "next/image";

const navLinks = [
    {href: "/", label: "Home"},
    {href: "/", label: "Events"},
    {href: "/", label: "Create Event"},
];

const Navbar = () => {
    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>
                    <p>DevEvent</p>
                </Link>

                <ul>
                    {navLinks.map((link) => (
                        <Link key={link.label} href={link.href}>
                            {link.label}
                        </Link>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;

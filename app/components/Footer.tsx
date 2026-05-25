import Link from "next/link";

export default function Footer() {
  return (
    <div className="flex gap-4 text-sm">
      <Link href="/privacy-policy">
        Privacy Policy
      </Link>

      <Link href="/terms-and-conditions">
        Terms & Conditions
      </Link>
    </div>
  );
}

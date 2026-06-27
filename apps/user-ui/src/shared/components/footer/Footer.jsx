// components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Top section with columns */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 ">
        <div>
          <h3 className="text-white font-semibold mb-3">Get to Know Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:underline">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/press" className="hover:underline">
                Press Releases
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Make Money with Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/sell" className="hover:underline">
                Sell on Our Platform
              </Link>
            </li>
            <li>
              <Link href="/affiliate" className="hover:underline">
                Affiliate Program
              </Link>
            </li>
            <li>
              <Link href="/advertising" className="hover:underline">
                Advertise Your Products
              </Link>
            </li>
            <li>
              <Link href="/partners" className="hover:underline">
                Become a Partner
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Payment Products</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/cards" className="hover:underline">
                Credit Cards
              </Link>
            </li>
            <li>
              <Link href="/wallet" className="hover:underline">
                Gift Cards
              </Link>
            </li>
            <li>
              <Link href="/rewards" className="hover:underline">
                Rewards
              </Link>
            </li>
            <li>
              <Link href="/finance" className="hover:underline">
                Financing Options
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Let Us Help You</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/account" className="hover:underline">
                Your Account
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:underline">
                Your Orders
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:underline">
                Shipping Rates & Policies
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Sokonis.com. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/cookies" className="hover:underline">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

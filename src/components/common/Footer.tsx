import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCcw, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#252525] text-white pt-14 pb-20 lg:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Marketplace Guarantees Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-stone-300">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#F36B25] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">Escrow Buyer Protection</div>
              <div className="text-xs text-stone-400 mt-0.5">Funds held safely until delivery confirmation</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#F36B25] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">Nationwide Dispatch</div>
              <div className="text-xs text-stone-400 mt-0.5">Doorstep delivery across all 36 Nigerian states</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCcw className="w-5 h-5 text-[#F36B25] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">Hassle-Free Returns</div>
              <div className="text-xs text-stone-400 mt-0.5">7 to 14 days verified merchant return policy</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-[#F36B25] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white">Secure Local Payments</div>
              <div className="text-xs text-stone-400 mt-0.5">Cards, USSD, Bank Transfer & Paystack/Flutterwave</div>
            </div>
          </div>
        </div>

        {/* Footer Links Hierarchy */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-xs">
          <div>
            <div className="text-base font-black text-white tracking-tight mb-3">
              Kumaji<span className="text-[#F36B25]">.</span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-xs mb-4">
              Nigeria's premier multi-vendor commerce platform connecting buyers with authentic verified merchants, designers, and artisans.
            </p>
            <div className="text-stone-400">
              Victoria Island, Lagos · Nigeria
            </div>
          </div>

          <div>
            <div className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
              Explore Categories
            </div>
            <ul className="space-y-2 text-stone-400">
              <li><Link to="/category/phones-tablets" className="hover:text-white transition-colors">Phones & Tablets</Link></li>
              <li><Link to="/category/computing-electronics" className="hover:text-white transition-colors">Computing & Audio</Link></li>
              <li><Link to="/category/mens-fashion" className="hover:text-white transition-colors">Men's Tailoring & Casuals</Link></li>
              <li><Link to="/category/womens-fashion" className="hover:text-white transition-colors">Women's Couture & Apparel</Link></li>
              <li><Link to="/category/bags-footwear" className="hover:text-white transition-colors">Artisanal Leather Bags & Shoes</Link></li>
              <li><Link to="/category/beauty-skincare" className="hover:text-white transition-colors">Organic Melanin Skincare</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
              Sell & Partner
            </div>
            <ul className="space-y-2 text-stone-400">
              <li><Link to="/seller/register" className="hover:text-white transition-colors text-[#F36B25] font-medium">Register as Merchant</Link></li>
              <li><Link to="/seller" className="hover:text-white transition-colors">Merchant Portal</Link></li>
              <li><Link to="/seller/orders" className="hover:text-white transition-colors">Fulfilment Rules & SLAS</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Platform Compliance</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
              Customer Service
            </div>
            <ul className="space-y-2 text-stone-400">
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/account/addresses" className="hover:text-white transition-colors">Shipping Rates & Zones</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Resolution Center</Link></li>
              <li><span className="text-stone-500">Support Hotline: +234 1 800 KUMAJI</span></li>
            </ul>
          </div>
        </div>

        {/* Quiet Bottom Copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Kumaji Technologies Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Merchant Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

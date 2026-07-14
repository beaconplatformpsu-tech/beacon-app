import logo from "@/assets/beacon-logo.jpg";
import { Facebook, Instagram, Phone, Mail, MapPin, Youtube, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useT } from "@/i18n/LanguageProvider";
import { XIcon } from "@/components/icons/XIcon";

export function SiteFooter() {
  const { session, role } = useCurrentUserRole();
  const t = useT();

  const guestLinks = [
    { href: "#home", label: t.nav.home },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
    { href: "#features", label: t.nav.features },
  ];
  const studentLinks = [
    { href: "#home", label: t.nav.dashboard },
    { href: "#features", label: t.nav.academicTasks },
    { href: "#modules", label: t.nav.skillsCareers },
    { href: "#about", label: t.nav.support },
    { href: "#contact", label: t.nav.feedback },
  ];
  const adminLinks = [
    { href: "/", label: t.nav.home },
    { href: "/admin", label: t.nav.adminDashboard },
    { href: "/admin/users", label: t.nav.manageUsers },
    { href: "/admin/content", label: t.nav.adminContent },
    { href: "/admin/messages", label: t.nav.adminMessages },
    { href: "/admin/settings", label: t.nav.platformSettings },
  ];
  const links = session ? (role === "admin" ? adminLinks : studentLinks) : guestLinks;

  return (
    <footer className="relative bg-primary text-primary-foreground pt-8 pb-6 mt-16">
      {/* SVG Top Curve Divider */}
      <div className="absolute bottom-full left-0 w-full overflow-hidden leading-[0] -mb-[1px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[50px] md:h-[80px] block">
            <path d="M0,120 L0,0 Q600,120 1200,0 L1200,120 Z" className="fill-primary"></path>
        </svg>
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Left Column: Organization Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src={logo.src}
                alt="Logo"
                className="h-16 w-16 object-cover rounded-full bg-white/10"
              />
              <div className="font-sans font-bold text-2xl tracking-widest">{t.footer.orgName}</div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              {t.footer.blurb}
            </p>
          </div>

          {/* Middle Column: Quick Links */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-base font-semibold text-white border-b border-white/20 pb-2 inline-block min-w-[120px]">
              {t.footer.quickLinks}
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              {links.map((item) => (
                <li key={item.label} className="group flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary-foreground/50 shrink-0" />
                  <a
                    href={item.href}
                    className="transition-all duration-200 hover:text-primary-foreground group-hover:translate-x-1 rtl:group-hover:-translate-x-1 block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Contact Us */}
          <div className="md:col-span-3">
            <h4 className="text-base font-semibold text-white border-b border-white/20 pb-2 inline-block min-w-[120px]">
              {t.footer.contactUs}
            </h4>
            <div className="mt-5 flex flex-col gap-4 text-sm text-white/80">
              <div className="flex items-center gap-3">
                 <Phone className="w-4 h-4 text-primary-foreground/60"/>
                 <span>00967777240900</span>
              </div>
              <div className="flex items-center gap-3">
                 <Mail className="w-4 h-4 text-primary-foreground/60"/>
                 <span>beaconplatformpsu@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                 <MapPin className="w-4 h-4 text-primary-foreground/60"/>
                 <span>{t.footer.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Social Icons */}
        <div className="mt-16 flex justify-center items-center gap-4">
          <a href="#" className="bg-white text-primary rounded-full p-2.5 hover:bg-white/90 transition-colors shadow-sm"><XIcon className="h-4 w-4" /></a>
          <a href="#" className="bg-white text-primary rounded-full p-2.5 hover:bg-white/90 transition-colors shadow-sm"><Linkedin className="h-4 w-4" /></a>
          <a href="#" className="bg-white text-primary rounded-full p-2.5 hover:bg-white/90 transition-colors shadow-sm"><Youtube className="h-4 w-4" /></a>
          <a href="#" className="bg-white text-primary rounded-full p-2.5 hover:bg-white/90 transition-colors shadow-sm"><Facebook className="h-4 w-4" /></a>
          <a href="#" className="bg-white text-primary rounded-full p-2.5 hover:bg-white/90 transition-colors shadow-sm"><Instagram className="h-4 w-4" /></a>
        </div>

        {/* Centered Copyright */}
        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col items-center text-center">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
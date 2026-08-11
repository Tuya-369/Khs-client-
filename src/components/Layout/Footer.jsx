import React from "react";
import {
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/khaanzaaservice/",
    icon: <FaInstagram size={14} />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100063051380290",
    icon: <FaFacebook size={14} />,
  },
  {
    label: "Gmail",
    href: "mailto:Gantuya.Office@gmail.com",
    icon: <FaEnvelope size={14} />,
  },
];

const contactItems = [
  {
    id: 1,
    icon: <FaPhone size={11} />,
    text: "72723355",
    href: "tel:72723355",
  },
  {
    id: 2,
    icon: <FaEnvelope size={11} />,
    text: "info@khs.mn  ",
    href: "mailto:info@khs.mn",
  },
  {
    id: 3,
    icon: <FaMapMarkerAlt size={11} />,
    text: "Industrial Street, 3rd Khoroo, Khan-Uul District, Ulaanbaatar 17060, Mongolia\nLocated opposite Gobi Corporation factory.",
    href: null,
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-neutral-50 border-t border-neutral-200/60 font-sans antialiased text-neutral-600"
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 mb-10">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold tracking-wider uppercase text-neutral-900">
              Khaanzaa Service LLC
            </div>
            <p className="text-[11px] text-orange-300 max-w-200px leading-relaxed">
              Build on Knowledge, Driven by Trust
            </p>
          </div>

          {/* Холбоо барих */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3.5">
              Contact Us
            </h4>
            <ul className="flex flex-col gap-2.5">
              {contactItems.map(({ id, icon, text, href }) => (
                <li
                  key={id}
                  className="flex items-center gap-2 text-neutral-500"
                >
                  <span className="text-neutral-400 flex items-center justify-center shrink-0 w-4">
                    {icon}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      className="text-[12px] transition-colors hover:text-yellow-500"
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="text-[12px]">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3.5">
              Social Media
            </h4>
            <div className="flex gap-4 items-center">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-neutral-400 hover:text-yellow-500 transition-colors duration-200 flex items-center justify-center"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200/40 pt-6 flex justify-between items-center text-[11px] text-neutral-400">
          <span>
            © {new Date().getFullYear()} Khaanzaa Service LLC. Бүх эрх хуулиар
            хамгаалагдсан.
          </span>
        </div>
      </div>
    </footer>
  );
}

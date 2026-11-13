import { ArrowUpRight, Cookie } from "lucide-react";
import type { Navigate } from "../types";
import { asset } from "../lib/utils";
import { Bow } from "./motion";

export function Footer({ onNavigate, onPrivacy }: { onNavigate: Navigate; onPrivacy: () => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <button className="wordmark footer-wordmark" onClick={() => onNavigate("home")} aria-label="Savorê by Pallavi, home">
            <img src={asset("savor-logo-clean.png")} alt="" width="1100" height="250" />
          </button>
          <p className="footer-tagline">A little goodness in every bite.</p>
          <Bow className="footer-bow" />
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <h2>Explore</h2>
          <ul>
            <li><button onClick={() => onNavigate("menu")}>The menu</button></li>
            <li><button onClick={() => onNavigate("story")}>Our story</button></li>
            <li><button onClick={() => onNavigate("visit")}>Find Savorê <ArrowUpRight size={14} aria-hidden="true" /></button></li>
            <li><a href={asset("savore-menu.pdf")} target="_blank" rel="noreferrer">Menu PDF <ArrowUpRight size={14} aria-hidden="true" /><span className="visually-hidden">(opens in a new tab)</span></a></li>
          </ul>
        </nav>
        <div className="footer-promise">
          <h2>Our promise</h2>
          <p>Freshly made<br />100% eggless<br />Preservative-free</p>
        </div>
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} Savorê by Pallavi</span>
        <button className="privacy-link" onClick={onPrivacy}><Cookie size={14} aria-hidden="true" /> Privacy choices</button>
      </div>
    </footer>
  );
}

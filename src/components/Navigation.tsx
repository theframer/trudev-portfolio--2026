"use client";

import { useState } from "react";

type NavigationProps = {
  onContactClick: () => void;
};

const navigationItems = [
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Skills",
    href: "#skills",
  },
  {
    label: "Experience",
    href: "#experience",
  },
  {
    label: "Work",
    href: "#work",
  },
  {
    label: "Projects",
    href: "#projects",
  },
  {
    label: "Blog",
    href: "#blog",
  },
];

export default function Navigation({
  onContactClick,
}: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavigation() {
    setMenuOpen(false);
  }

  function handleContactClick() {
    setMenuOpen(false);
    onContactClick();
  }

  return (
    <header
      className={`site-header ${
        menuOpen ? "menu-open" : ""
      }`}
    >
      <nav
        className="navigation"
        aria-label="Primary navigation"
      >
        <a
          className="brand"
          href="#top"
          aria-label="TRUDEV home"
          onClick={handleNavigation}
        >
          TRUDEV
        </a>

        {/* Desktop Navigation */}

        <div className="navigation-links navigation-desktop">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleNavigation}
            >
              {item.label}
            </a>
          ))}

<button
  type="button"
  tabIndex={menuOpen ? 0 : -1}
  onClick={handleContactClick}
>
  {/* <span>07</span> */}
  <strong>GET IN TOUCH</strong>
  {/* <em aria-hidden="true">↗</em> */}
</button>
        </div>

        {/* Mobile Menu Button */}

        <button
          className="menu-toggle"
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() =>
            setMenuOpen((open) => !open)
          }
        >
          <span
            className="menu-icon"
            aria-hidden="true"
          >
            <span />
            <span />
          </span>
        </button>

        {/* Mobile Navigation */}

        <div
          id="mobile-navigation"
          className={`mobile-navigation ${
            menuOpen
              ? "mobile-navigation-open"
              : ""
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="mobile-navigation-inner">
            <p className="mobile-navigation-label">
              NAVIGATION
            </p>

            <div className="mobile-navigation-links">
              {navigationItems.map(
                (item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    tabIndex={
                      menuOpen ? 0 : -1
                    }
                    onClick={
                      handleNavigation
                    }
                  >
                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {item.label}
                    </strong>

                    <em aria-hidden="true">
                      ↗
                    </em>
                  </a>
                )
              )}

              <button
                type="button"
                tabIndex={
                  menuOpen ? 0 : -1
                }
                onClick={
                  handleContactClick
                }
              >
                <span>
                  07
                </span>
                <strong>Ping Me
                </strong>

                <em aria-hidden="true">
                  ↗
                </em>
              </button>
            </div>

            <div className="mobile-navigation-footer">
              <span>TRUDEV</span>
              <span>
                SOFTWARE DEVELOPER · INDIA
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
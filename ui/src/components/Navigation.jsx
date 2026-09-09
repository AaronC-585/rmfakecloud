import React from "react";
import { Nav, Navbar, Button, NavDropdown, Container } from "react-bootstrap";
import { logout } from "../common/actions";
import { useAuthState } from "../common/useAuthContext";
import { useShellTheme } from "../common/ThemeContext";
import { ThemeIcon } from "../common/themeIcons";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Navigation.module.scss";

const NAV_META = {
  documents: { label: "Documents", path: "/documents" },
  integrations: { label: "Integrations", path: "/integrations" },
  connect: { label: "Connect", path: "/connect" },
  screenshare: { label: "Screen Share", path: "/screenshare" },
  admin: { label: "Admin", path: "/admin" },
};

function pathActive(pathname, path) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

const NavigationBar = () => {
  const { state: { user }, dispatch } = useAuthState();
  const { layout } = useShellTheme();
  const location = useLocation();

  function handleLogout() {
    logout(dispatch);
  }

  function isAdmin() {
    return user && user.Roles && user.Roles[0] === "Admin";
  }

  const brandIcon = layout?.icons?.brand || "cloud";
  const profileIcon = layout?.icons?.profile || "person";
  const chrome = layout?.chrome || { style: "flat" };
  const chromeStyle = chrome.style || "flat";
  const items = (layout?.nav?.items || []).filter((it) => {
    if (!it.visible) return false;
    if (it.adminOnly && !isAdmin()) return false;
    return Boolean(NAV_META[it.id]);
  });

  const userMenu = user ? (
    <Nav className={chromeStyle === "flat" ? (layout?.nav?.userMenu === "start" ? "me-auto" : "ms-auto") : undefined}>
      <NavDropdown
        id="userMenu"
        title={
          <span>
            <ThemeIcon name={profileIcon} />
            {user.UserID}
          </span>
        }
        align="end"
      >
        <NavDropdown.Item as={NavLink} to="/profile">
          Profile
        </NavDropdown.Item>
        {isAdmin() ? (
          <NavDropdown.Item as={NavLink} to="/admin/themes">
            Themes
          </NavDropdown.Item>
        ) : null}
        <NavDropdown.Divider />
        <NavDropdown.Item as={Button} onClick={handleLogout}>
          Log out
        </NavDropdown.Item>
      </NavDropdown>
    </Nav>
  ) : null;

  if (chromeStyle === "folders" || chromeStyle === "outlines" || chromeStyle === "tabbed") {
    const chromeClass =
      chromeStyle === "folders"
        ? styles.chromeFolders
        : chromeStyle === "outlines"
          ? styles.chromeOutlines
          : styles.chromeTabbed;

    return (
      <nav className={`${styles.chromeRoot} ${chromeClass}`} aria-label="Main">
        <div className={styles.drawer}>
          <NavLink to="/" className={styles.brand}>
            <ThemeIcon name={brandIcon} />
            rmfakecloud
          </NavLink>
          {user ? (
            <>
              <ul className={styles.tabs}>
                {items.map((it) => {
                  const meta = NAV_META[it.id];
                  const active = pathActive(location.pathname, meta.path);
                  return (
                    <li key={it.id}>
                      <NavLink
                        to={meta.path}
                        className={`${styles.tab} ${active ? styles.tabActive : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <ThemeIcon name={it.icon || layout.icons[it.id] || it.id} />
                        {meta.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.userSlot}>{userMenu}</div>
            </>
          ) : null}
        </div>
      </nav>
    );
  }

  const brand = (
    <Navbar.Brand>
      <Nav.Link as={NavLink} to="/">
        <ThemeIcon name={brandIcon} />
        rmfakecloud
      </Nav.Link>
    </Navbar.Brand>
  );

  const mainNav = user ? (
    <Navbar.Collapse>
      <Nav>
        {items.map((it) => {
          const meta = NAV_META[it.id];
          return (
            <Nav.Item key={it.id}>
              <Nav.Link as={NavLink} to={meta.path}>
                <ThemeIcon name={it.icon || layout.icons[it.id] || it.id} />
                {meta.label}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
      {layout?.nav?.userMenu !== "start" ? userMenu : null}
    </Navbar.Collapse>
  ) : null;

  return (
    <Navbar className={`sticky-top ${styles.chromeFlat}`}>
      <Container fluid>
        {layout?.nav?.brandPosition === "end" ? (
          <>
            {user && layout?.nav?.userMenu === "start" ? userMenu : null}
            {mainNav}
            {brand}
          </>
        ) : (
          <>
            {brand}
            {user && layout?.nav?.userMenu === "start" ? userMenu : null}
            <Navbar.Toggle />
            {mainNav}
          </>
        )}
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

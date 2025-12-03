import styles from "./navigation.module.css";
import { NavLink } from "react-router";

const navItems = [
  { to: "/", label: "Главная", end: true },
  { to: "/calendar", label: "Календарь" },
];
export function Navigation() {
  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive ? `${styles.link} ${styles.linkActive}` : styles.link;
  };
  return (
    <nav className={styles.menu}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={getLinkClassName}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

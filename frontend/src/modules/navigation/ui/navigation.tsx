import styles from "./navigation.module.css";
import { NavLink } from "react-router";
import homeIcon from "/home-icon.svg";
import calendarIcon from "/calendar-icon.svg";

const navItems = [
  { to: "/", icon: homeIcon, end: true },
  { to: "/calendar", icon: calendarIcon },
];
export function Navigation() {
  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive ? `${styles.link} ${styles.linkActive}` : styles.link;
  };
  return (
    <nav className={styles.menu}>
      {navItems.map((item) => (
        <div className={styles.item}>
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={getLinkClassName}
          >
            <img src={item.icon} className={styles.icon} alt="icon" />
          </NavLink>
        </div>
      ))}
    </nav>
  );
}

import styles from "./navigation.module.css";
import { NavLink } from "react-router";
import homeIcon from "/home-icon.svg";
import homeIconBlack from "/home-icon-black.svg";
import calendarIcon from "/calendar-icon.svg";
import calendarIconBlack from "/calendar-icon-black.svg";

const navItems = [
  { to: "/", icon: homeIcon, iconActive: homeIconBlack, end: true },
  { to: "/calendar", icon: calendarIcon, iconActive: calendarIconBlack },
];
export function Navigation() {
  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    return isActive ? `${styles.link} ${styles.linkActive}` : styles.link;
  };
  return (
    <nav className={styles.menu}>
      {navItems.map((item) => (
        <div key={item.to} className={styles.item}>
          <NavLink
            to={item.to}
            end={item.end}
            className={getLinkClassName}
          >
            {({ isActive }) => (
              <img 
                src={isActive ? item.iconActive : item.icon} 
                className={styles.icon} 
                alt="icon" 
              />
            )}
          </NavLink>
        </div>
      ))}
    </nav>
  );
}

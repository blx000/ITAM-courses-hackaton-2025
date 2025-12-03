import styles from "./header.module.css";
import profileIcon from "/profile-icon.svg";
import bell from "/bell.svg";
import { NavLink } from "react-router";

export function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.flexLeft}>
        <NavLink to={"/profile"}>
          <img src={profileIcon} alt="profile-icon" />
        </NavLink>
        <h1>HackMate</h1>
      </div>
      <img src={bell} alt="bell-icon" />
    </div>
  );
}

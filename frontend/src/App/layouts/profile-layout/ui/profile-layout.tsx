import styles from "./profile-layout.module.css";
import { Outlet } from "react-router";
import { Navigation } from "../../../../modules/navigation";
import { ProfileHeader } from "../../../../modules/profile-header";

export function ProfileLayout() {
  return (
    <div className={styles.container}>
      <ProfileHeader />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}

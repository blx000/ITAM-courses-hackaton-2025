import { Outlet } from "react-router";
import styles from "./admin-layout.module.css";

export function AdminLayout() {
  return (
    <div className={styles.container}>
      <Outlet />
    </div>
  );
}




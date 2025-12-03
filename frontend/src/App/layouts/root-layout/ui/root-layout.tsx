import styles from "./root-layout.module.css";
import { Outlet } from "react-router";
import { Navigation } from "../../../../modules/navigation";
import { Header } from "../../../../modules/header";

export function RootLayout() {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}

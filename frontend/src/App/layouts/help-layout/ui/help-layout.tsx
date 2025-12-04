import styles from "./help-layout.module.css";
import { Outlet } from "react-router";
import { Navigation } from "../../../../modules/navigation";
import { HelpHeader } from "../../../../modules/help-header";

export function HelpLayout() {
  return (
    <div className={styles.container}>
      <HelpHeader />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}

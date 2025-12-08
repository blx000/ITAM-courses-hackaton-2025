import styles from "./form-layout.module.css";
import { Outlet } from "react-router";
import { Navigation } from "../../../../modules/navigation";
import { FormHeader } from "../../../../modules/form-header";

export function FormLayout() {
  return (
    <div className={styles.container}>
      <FormHeader />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}

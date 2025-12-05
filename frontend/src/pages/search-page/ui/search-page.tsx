import styles from "./search-page.module.css";
import { HackathonSearch } from "../../../modules/hackathon-search";
import { Navigation } from "../../../modules/navigation";

export function SearchPage() {
  return (
    <div className={styles.container}>
      <HackathonSearch />
      <Navigation />
    </div>
  );
}

import { useState, useEffect } from "react";
import styles from "./root-layout.module.css";
import { Outlet } from "react-router";
import { Navigation } from "../../../../modules/navigation";
import { RootHeader } from "../../../../modules/root-header";
import { AuthModal } from "../../../../shared/components/auth-modal";
import { AuthService } from "../../../../api/services/auth.service";

export function RootLayout() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setShowAuthModal(true);
    }
  }, []);

  return (
    <div className={styles.container}>
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            if (AuthService.isAuthenticated()) {
              setShowAuthModal(false);
            }
          }}
        />
      )}
      <RootHeader />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}

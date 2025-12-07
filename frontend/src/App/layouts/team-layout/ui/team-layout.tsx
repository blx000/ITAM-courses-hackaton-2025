import styles from "./team-layout.module.css";
import { Outlet } from "react-router";
import { Navigation } from "../../../../modules/navigation";
import { AuthModal } from "../../../../shared/components/auth-modal";
import { AuthService } from "../../../../api/services/auth.service";
import { useState, useEffect } from "react";

export function TeamLayout() {
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
      <div className={styles.main}>
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}


import { useEffect } from "react";
import styles from "./toast.module.css";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      </div>
    </div>
  );
}




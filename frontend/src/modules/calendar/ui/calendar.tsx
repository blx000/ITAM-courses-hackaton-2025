import { useState } from "react";
import styles from "./calendar.module.css";
import leftArrow from "/left-arrow.svg";
import rightArrow from "/right-arrow.svg";

const getMonthName = (date: Date): string => {
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return months[date.getMonth()];
};
const getShortDayName = (dayIndex: number): string => {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return days[dayIndex];
};

export function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const daysInMonth = lastDay.getDate();
    const days = [];

    for (let i = 0; i < startDay; i++) {
      const prevMonthDate = new Date(year, month, i - startDay + 1);
      days.push({
        date: prevMonthDate,
        dayNumber: prevMonthDate.getDate(),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();
      days.push({
        date: dayDate,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
      });
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDate,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }
    return days;
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };
  const days = generateDays();
  const monthName = getMonthName(currentDate);
  const year = currentDate.getFullYear();

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth} className={styles.navButton}>
          <img src={leftArrow} alt="left-arrow" />
        </button>
        <span className={styles.currentMonth}>
          <span className={styles.month}>{monthName}</span>
          <span className={styles.year}>{year}</span>
        </span>
        <button onClick={nextMonth} className={styles.navButton}>
          <img src={rightArrow} alt="right-arrow" />
        </button>
      </div>
      <div className={styles.weekdays}>
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <div key={dayIndex} className={styles.weekday}>
            {getShortDayName(dayIndex)}
          </div>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {days.map((day, index) => (
          <div
            key={index}
            className={`${styles.day} ${
              day.isCurrentMonth ? styles.currentMonthDay : styles.otherMonthDay
            } ${day.isToday ? styles.today : ""}`}
          >
            <div className={styles.dayNumber}>{day.dayNumber}</div>
            {day.isToday && <div className={styles.todayIndicator} />}
          </div>
        ))}
      </div>
    </div>
  );
}

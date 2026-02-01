import { useState } from "react";
import styles from "./FAQPage.module.scss";

type FAQItem = { question: string; answer: string };
type FAQGroup = { title: string; items: FAQItem[] };

const faqData: FAQGroup[] = [
  {
    title: "Game Basics",
    items: [
      {
        question: "What kind of game is this?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.",
      },
      {
        question: "Is the game multiplayer?",
        answer:
          "Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.",
      },
    ],
  },
  {
    title: "Installation & Technical",
    items: [
      {
        question: "What are the minimum requirements?",
        answer:
          "Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.",
      },
      {
        question: "Game won't start?",
        answer:
          "Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openGroup, setOpenGroup] = useState<number | null>(0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Frequently Asked Questions</h1>
        <p>Everything players usually need to know</p>
      </div>

      <div className={styles.container}>
        {faqData.map((group, gIndex) => {
          const isOpen = openGroup === gIndex;
          return (
            <section
              key={gIndex}
              className={`${styles.group} ${isOpen ? styles.open : ""}`}
            >
              <button
                className={styles.groupTitle}
                onClick={() => setOpenGroup(isOpen ? null : gIndex)}
              >
                {group.title}
                <span className={styles.indicator}>
                  {isOpen ? "–" : "+"}
                </span>
              </button>

              <div className={styles.content}>
                {group.items.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <p className={styles.q}>
                      <span>Q:</span> {item.question}
                    </p>
                    <p className={styles.a}>
                      <span>A:</span> {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

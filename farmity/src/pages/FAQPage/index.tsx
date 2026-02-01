import { useState } from "react";
import "./faq.css";

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
    <div className="faq-page">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Everything players usually need to know</p>
      </div>

      <div className="faq-container">
        {faqData.map((group, gIndex) => (
          <section
            key={gIndex}
            className={`faq-group ${openGroup === gIndex ? "open" : ""}`}
          >
            <button
              className="faq-group-title"
              onClick={() =>
                setOpenGroup(openGroup === gIndex ? null : gIndex)
              }
            >
              {group.title}
              <span className="indicator">
                {openGroup === gIndex ? "–" : "+"}
              </span>
            </button>

            <div className="faq-content">
              {group.items.map((item, i) => (
                <div key={i} className="faq-item">
                  <p className="faq-q">
                    <span>Q:</span> {item.question}
                  </p>
                  <p className="faq-a">
                    <span>A:</span> {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

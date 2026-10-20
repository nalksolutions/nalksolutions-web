import { AnimatedDisclosure } from '../site/animated-disclosure';
import { Icon } from '../site/icon';

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <AnimatedDisclosure
      className="home-glass-card"
      bodyClassName="home-faq-answer"
      summary={
        <>
          {question}
          <span aria-hidden="true">
            <Icon name="down" />
          </span>
        </>
      }
    >
      <p>{answer}</p>
    </AnimatedDisclosure>
  );
}

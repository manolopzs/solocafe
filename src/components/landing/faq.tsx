import { Icon } from '@/components/ui/icon'
import { Reveal } from './reveal'

const faqs = [
  {
    question: 'What is Solo Café?',
    answer:
      'Order ahead from your cafe and skip the queue. You order on your phone, they make it, you pay when you pick up.',
  },
  {
    question: 'Do I need to download an app?',
    answer: 'The iOS app is coming soon. Join the waitlist to hear when it is out.',
  },
  {
    question: 'How do I pay?',
    answer: 'You pay at the cafe when you pick up your order.',
  },
  {
    question: 'How do I know my order is ready?',
    answer:
      'Your order screen switches to Ready and shows a short pickup code. Show that code at the counter to collect your drink.',
  },
  {
    question: 'I run a cafe, what does it cost?',
    answer: 'Solo Café is free during the pilot. See the Pricing section for details.',
  },
  {
    question: 'What does my cafe need?',
    answer:
      'A phone, tablet or computer with a browser for the bar screen. You set up your menu yourself.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 bg-background px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">FAQ</p>
          <h2 className="mt-3 text-center landing-font-display text-3xl font-normal tracking-tight text-heading sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>
        <div className="landing-faq mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={(index % 3) + 1 as 1 | 2 | 3}>
              <details className="landing-faq-item group rounded-2xl border border-border bg-surface-elevated">
                <summary className="flex cursor-pointer items-center justify-between p-5">
                  <span className="pr-4 text-base font-semibold text-foreground">{faq.question}</span>
                  <Icon
                    name="chevron-down"
                    className="landing-faq-chevron h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200"
                  />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground">{faq.answer}</div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

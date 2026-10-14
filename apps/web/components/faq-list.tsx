import type { Faq } from "@sfs/shared";
import { ChevronDown } from "lucide-react";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <details
          key={faq.id}
          name="faq"
          open={i === 0}
          className="group rounded-2xl border border-slate-100 bg-white px-5 shadow-sm open:border-brand-200 open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold text-navy [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown className="size-5 shrink-0 text-brand-600 transition group-open:rotate-180" />
          </summary>
          <p className="pb-5 text-[15px] leading-relaxed text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm tracking-[0.4em] uppercase text-rust">{children}</div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "border border-ink/25 rounded-sm bg-cream-card px-4 py-3.5 text-lg font-light text-ink outline-none focus:border-maroon " +
        className
      }
    />
  );
}

export function DarkInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "border border-blush/35 rounded-sm bg-cream/[0.08] px-4 py-3.5 text-lg font-light text-cream outline-none focus:border-gold " +
        className
      }
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={
        "border border-ink/25 rounded-sm bg-cream-card px-4 py-3.5 text-lg font-light text-ink outline-none focus:border-maroon " +
        className
      }
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      {...rest}
      className={
        "border border-ink/25 rounded-sm bg-cream px-2.5 py-2 text-base font-light text-ink outline-none focus:border-maroon " +
        className
      }
    />
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[13px] tracking-[0.18em] uppercase text-ink/70">
      {children}
    </span>
  );
}

export function Chip({
  active,
  children,
  ...rest
}: {
  active: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      type="button"
      className={
        "whitespace-nowrap rounded-full px-[18px] py-2.5 text-[13px] tracking-[0.15em] uppercase border cursor-pointer transition-colors " +
        (active
          ? "bg-maroon-deep text-cream border-maroon-deep/50"
          : "bg-transparent text-ink/70 border-ink/22 hover:border-ink/40")
      }
    >
      {children}
    </button>
  );
}

export function AdminChip({
  active,
  children,
  ...rest
}: {
  active: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      type="button"
      className={
        "whitespace-nowrap rounded-sm px-4 py-2.5 text-[13px] tracking-[0.16em] uppercase border-none cursor-pointer " +
        (active ? "bg-maroon text-cream" : "bg-transparent text-ink/70 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

const PAY_PILL_STYLES: Record<string, string> = {
  VERIFIED: "bg-maroon text-cream border-transparent",
  REJECTED: "bg-maroon-deep/10 text-maroon-deep border-maroon-deep/40",
  PENDING: "bg-gold text-ink border-transparent",
  ON_PICKUP: "bg-transparent text-ink/60 border-ink/25",
};

const PAY_PILL_LABELS: Record<string, string> = {
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  PENDING: "Pending",
  ON_PICKUP: "On pickup",
};

export function PayPill({ status }: { status: string }) {
  return (
    <span
      className={
        "inline-block whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] tracking-[0.14em] uppercase " +
        (PAY_PILL_STYLES[status] ?? PAY_PILL_STYLES.ON_PICKUP)
      }
    >
      {PAY_PILL_LABELS[status] ?? status}
    </span>
  );
}

const ORDER_PILL_STYLES: Record<string, string> = {
  TO_BAKE: "bg-cream-warm text-maroon-deep border-transparent",
  BAKING: "bg-cream-warm text-maroon-deep border-transparent",
  READY: "bg-cream-warm text-maroon-deep border-transparent",
  COMPLETED: "bg-transparent text-ink/55 border-ink/25",
  CANCELLED: "bg-ink/8 text-ink/50 border-transparent",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  TO_BAKE: "To bake",
  BAKING: "Baking",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderPill({ status }: { status: string }) {
  return (
    <span
      className={
        "inline-block whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] tracking-[0.14em] uppercase " +
        (ORDER_PILL_STYLES[status] ?? ORDER_PILL_STYLES.TO_BAKE)
      }
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function StockDot({ stock }: { stock: number }) {
  const color = stock === 0 ? "bg-ink/30" : stock <= 5 ? "bg-gold" : "bg-maroon-deep";
  return <span className={"inline-block h-[7px] w-[7px] rounded-full " + color} />;
}

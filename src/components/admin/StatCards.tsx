import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

const StatCards = ({ items }: { items: StatCardProps[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold tracking-[0.2em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-card-foreground">{item.value}</p>
              {item.helper && <p className="text-xs text-muted-foreground mt-1">{item.helper}</p>}
            </div>
            {item.icon && <div className="text-primary">{item.icon}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;



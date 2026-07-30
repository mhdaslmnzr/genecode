import type { FlatShirt } from "@/lib/types";
import { ShirtCard } from "./ShirtCard";

export function ShirtGrid({ items }: { items: FlatShirt[] }) {
  return (
    <div className="collection__grid" role="list">
      {items.map((item) => (
        <ShirtCard key={item.key} item={item} />
      ))}
    </div>
  );
}

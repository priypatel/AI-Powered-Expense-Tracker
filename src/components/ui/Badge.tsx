import { clsx } from "clsx";
import type { Category } from "@/types/index";

const BADGE_CLASSES: Record<Category, string> = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Shopping: "bg-purple-100 text-purple-700",
  Entertainment: "bg-pink-100 text-pink-700",
  Health: "bg-green-100 text-green-700",
  Utilities: "bg-yellow-100 text-yellow-800",
  Housing: "bg-indigo-100 text-indigo-700",
  Education: "bg-teal-100 text-teal-700",
  Travel: "bg-rose-100 text-rose-700",
  Other: "bg-gray-100 text-gray-600",
};

interface BadgeProps {
  category: Category;
}

export function Badge({ category }: BadgeProps): JSX.Element {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        BADGE_CLASSES[category]
      )}
    >
      {category}
    </span>
  );
}

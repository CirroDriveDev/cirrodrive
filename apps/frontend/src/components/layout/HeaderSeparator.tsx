import { Separator } from "#shadcn/components/Separator.js";

export function HeaderSeparator(): JSX.Element {
  return (
    <Separator
      orientation="vertical"
      className="data-[orientation=vertical]:h-4"
    />
  );
}

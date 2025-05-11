import { type EntryDTO } from "@cirrodrive/schemas";
import { EntryItem } from "@/components/EntryItem.tsx";

interface TrashEntryListProps {
  entries: EntryDTO[];
}

export function TrashEntryList({ entries }: TrashEntryListProps): JSX.Element {
  return (
    <div className="flex w-full flex-col">
      {/* px-16 = px-4 + icon 8 + gap-x-4 */}
      <div className="flex w-full gap-x-4 px-16 py-2">
        <div className="min-w-32 flex-grow">이름</div>
        <div className="w-52">수정 날짜</div>
        <div className="w-16">크기</div>
      </div>
      <div className="flex h-[720px] w-full flex-col divide-y-[1px] divide-muted-foreground overflow-auto border-y-[1px] border-y-muted-foreground">
        {entries.map((entry) => (
          <EntryItem
            key={`${entry.id}:${entry.name}:${entry.type}`}
            entry={entry}
            onDoubleClick={() => {
              // noop
            }}
          />
        ))}
      </div>
    </div>
  );
}

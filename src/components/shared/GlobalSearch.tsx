import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EzInput } from "@clarium/ezui-react-components";
import { Search, FileText, ListTodo, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSOP {
  id: string;
  title: string;
  status: string;
  owner: string;
  businessProcessName?: string;
}

export interface SearchableTask {
  id: string;
  name: string;
  operation?: string;
  owner: string;
  moduleId: string;
  moduleName?: string;
  riskLevel: string;
}

interface GlobalSearchProps {
  /** SOPs scoped to the current department to search over. */
  sops: SearchableSOP[];
  /** Tasks scoped to the current department to search over. */
  tasks: SearchableTask[];
  /** Called when user clicks a SOP result — receives SOP id. */
  onSopSelect: (sopId: string) => void;
  /** Called when user clicks a Task result — receives task id. */
  onTaskSelect: (taskId: string) => void;
}

/**
 * Unified top-bar search across SOPs and Work Inventory simultaneously.
 * Accepts pre-filtered data as props so it never needs to call multiple contexts.
 */
export function GlobalSearch({ sops, tasks, onSopSelect, onTaskSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Close dropdown when clicking outside. */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = query.toLowerCase().trim();

  /** Filter SOPs — matches id, title, owner. */
  const sopResults = useMemo(() => {
    if (!q) return [];
    return sops.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.owner.toLowerCase().includes(q) ||
        (s.businessProcessName && s.businessProcessName.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [sops, q]);

  /** Filter Tasks — matches id, name, owner, module, operation. */
  const taskResults = useMemo(() => {
    if (!q) return [];
    return tasks.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) ||
        (t.moduleName && t.moduleName.toLowerCase().includes(q)) ||
        (t.operation && t.operation.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [tasks, q]);

  const hasResults = sopResults.length > 0 || taskResults.length > 0;
  const showDropdown = open && query.trim().length > 0;

  const handleSopClick = (sopId: string) => {
    onSopSelect(sopId);
    setQuery("");
    setOpen(false);
  };

  const handleTaskClick = (taskId: string) => {
    onTaskSelect(taskId);
    setQuery("");
    setOpen(false);
  };

  /** SOP status badge color. */
  const getSopStatusColor = (status: string) => {
    if (status === "Effective") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (status === "In Review" || status === "Approved") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-muted-foreground bg-muted border-border";
  };

  return (
    <div ref={containerRef} className="relative w-72">
      <EzInput
        placeholder="Search SOPs and tasks…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        suffix={
          <div className="flex items-center gap-1.5">
            {query && (
              <button
                onClick={() => { setQuery(""); setOpen(false); }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <Search className="h-4 w-4 text-muted-foreground mr-1" />
          </div>
        }
        className="text-sm pr-2"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border bg-popover shadow-lg overflow-hidden">
          {!hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results for <span className="font-medium">"{query}"</span>
            </div>
          ) : (
            <>
              {/* SOP Results Group */}
              {sopResults.length > 0 && (
                <div>
                  <div className="px-3 pt-3 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      SOPs
                    </span>
                  </div>
                  {sopResults.map((sop) => (
                    <button
                      key={sop.id}
                      onClick={() => handleSopClick(sop.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0">{sop.id}</span>
                      <span className="text-sm flex-1 truncate">{sop.title}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0", getSopStatusColor(sop.status))}>
                        {sop.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Divider */}
              {sopResults.length > 0 && taskResults.length > 0 && (
                <div className="mx-3 border-t" />
              )}

              {/* Task Results Group */}
              {taskResults.length > 0 && (
                <div>
                  <div className="px-3 pt-3 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <ListTodo className="h-3 w-3" />
                      Tasks
                    </span>
                  </div>
                  {taskResults.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0">{task.id}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{task.name}</p>
                        {task.moduleName && (
                          <p className="text-[10px] text-muted-foreground truncate">{task.moduleName}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{task.riskLevel}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t p-1.5 text-center">
                <span className="text-[10px] text-muted-foreground">
                  {sopResults.length + taskResults.length} result{sopResults.length + taskResults.length !== 1 ? "s" : ""} — press Esc to close
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

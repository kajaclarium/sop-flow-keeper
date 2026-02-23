import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Plus, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { FormatIcon } from "@/components/FormatIcon";
import { AppSidebar } from "@/components/AppSidebar";
import { mockSOPs, type SOPRecord } from "@/data/mockSOPs";
import { cn } from "@/lib/utils";

const filterOptions = ["All", "Draft", "In Review", "Effective"] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = mockSOPs.filter((sop) => {
    const matchesSearch =
      sop.title.toLowerCase().includes(search.toLowerCase()) ||
      sop.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || sop.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 px-8 h-16 border-b bg-card shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SOPs by title or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-transparent focus:bg-card"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/create")}>
            <Plus className="h-4 w-4" />
            Create New SOP
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          {/* Page heading & filter chips */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">SOP Registry</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} sealed system records
            </p>
          </div>

          <div className="flex items-center gap-2 mb-5">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                  activeFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/20"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>SOP ID & Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Edited By</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead className="text-center">Version</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sop) => (
                  <SOPRow key={sop.id} sop={sop} />
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No SOPs match your search or filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}

function SOPRow({ sop }: { sop: SOPRecord }) {
  const isLocked = sop.status === "Effective";

  return (
    <TableRow
      className={cn(
        "group cursor-pointer transition-colors",
        isLocked && "bg-muted/30"
      )}
    >
      <TableCell>
        <FormatIcon format={sop.format} />
      </TableCell>
      <TableCell>
        <div>
          <span className="text-xs font-mono text-muted-foreground">{sop.id}</span>
          <p className="font-medium text-sm mt-0.5">{sop.title}</p>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{sop.owner}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{sop.lastEditedBy}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {sop.approvedBy ?? <span className="text-muted-foreground/40">—</span>}
      </TableCell>
      <TableCell className="text-center">
        <span className="inline-flex items-center gap-1 text-sm font-mono">
          {isLocked && <Lock className="h-3 w-3 text-status-effective" />}
          {sop.version}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge status={sop.status} />
      </TableCell>
    </TableRow>
  );
}

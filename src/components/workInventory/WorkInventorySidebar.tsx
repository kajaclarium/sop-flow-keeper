import { useState, useMemo } from "react";
import { useWorkInventory } from "@/contexts/WorkInventoryContext";
import { WorkModule, WorkTask } from "@/types/workInventory";
import { EzInput, EzButton } from "@clarium/ezui-react-components";
import { 
  Search, Layers, ChevronRight, ChevronDown, ListTodo, 
  LayoutGrid, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hierarchical sidebar for navigating the Process Registry.
 * Tree Structure: Module (Process) -> Operation -> Task
 */
export function WorkInventorySidebar() {
  const { 
    modules, tasks, operations, selectedModuleId, selectedTaskId, selectedOperationId,
    navigateToModules, navigateToTasks, navigateToOperation, navigateToTaskDetail 
  } = useWorkInventory();
  
  const [search, setSearch] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedOperations, setExpandedOperations] = useState<string[]>([]);

  // Toggle module expansion
  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Toggle operation expansion
  const toggleOperation = (opKey: string) => {
    setExpandedOperations(prev => 
      prev.includes(opKey) ? prev.filter(item => item !== opKey) : [...prev, opKey]
    );
  };

  // Group tasks by module and operation
  const groupedData = useMemo(() => {
    return modules.map(mod => {
      const modTasks = tasks.filter(t => t.moduleId === mod.id);
      const modOperations = operations.filter(o => o.moduleId === mod.id);
      
      // Group tasks by operationId
      const tasksByOp: Record<string, WorkTask[]> = {};
      modTasks.forEach(task => {
        const opId = task.operationId || "unassigned";
        if (!tasksByOp[opId]) tasksByOp[opId] = [];
        tasksByOp[opId].push(task);
      });

      return {
        ...mod,
        operations: modOperations.map(op => ({
          ...op,
          tasks: tasksByOp[op.id] || []
        })),
        unassignedTasks: tasksByOp["unassigned"] || [],
        isVisible: mod.name.toLowerCase().includes(search.toLowerCase()) || 
                   modTasks.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
      };
    }).filter(m => m.isVisible);
  }, [modules, tasks, operations, search]);

  return (
    <aside className="w-64 border-r bg-card flex flex-col shrink-0 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Process Navigator
        </h3>
        <EzInput
          placeholder="Search flows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          suffix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
          className="h-8 text-xs"
        />
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Process Registry Root */}
        <button
          onClick={navigateToModules}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors",
            !selectedModuleId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Process Registry</span>
        </button>

        <div className="pt-2 pb-1 px-3">
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Workflows
          </span>
        </div>

        {groupedData.map(mod => {
          const isExpanded = expandedModules.includes(mod.id) || search.length > 0 || selectedModuleId === mod.id;
          const isActive = selectedModuleId === mod.id && !selectedTaskId;

          return (
            <div key={mod.id} className="space-y-0.5">
              <div 
                className={cn(
                  "flex items-center gap-1 group rounded-md transition-colors",
                  isActive ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                )}
              >
                <button 
                  onClick={() => toggleModule(mod.id)}
                  className="p-1 hover:bg-accent rounded"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => navigateToTasks(mod.id)}
                  className="flex-1 flex items-center gap-2 py-1.5 text-xs text-left font-medium truncate"
                >
                  <Layers className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground/70")} />
                  <span className="truncate">{mod.name}</span>
                </button>
              </div>

              {/* Operations/Tasks Level */}
              {isExpanded && (
                <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5 mt-0.5">
                  {mod.operations.map((op) => {
                    const opKey = op.id;
                    const isOpExpanded = expandedOperations.includes(opKey) || 
                                         search.length > 0 || 
                                         op.tasks.some(t => t.id === selectedTaskId) ||
                                         selectedOperationId === op.id;
                    
                    return (
                      <div key={opKey} className="space-y-0.5">
                        <div 
                          className={cn(
                            "flex items-center gap-1 group rounded-md px-1 py-1 transition-colors",
                            selectedOperationId === op.id ? "bg-accent/40 text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <button 
                            onClick={() => toggleOperation(opKey)}
                            className="p-0.5 hover:bg-accent rounded"
                          >
                            {isOpExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                          </button>
                          <button
                            onClick={() => navigateToOperation(mod.id, op.id)}
                            className="flex-1 text-[11px] font-semibold text-left truncate"
                          >
                             {op.name}
                          </button>
                        </div>

                        {/* Tasks Level */}
                        {isOpExpanded && (
                          <div className="ml-3 space-y-0.5">
                            {op.tasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => navigateToTaskDetail(task.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors",
                                  selectedTaskId === task.id 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                              >
                                <ListTodo className="h-3 w-3 shrink-0" />
                                <span className="truncate">{task.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unassigned Tasks */}
                  {mod.unassignedTasks.length > 0 && (
                     <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground group rounded-md px-1 py-1">
                          <button 
                            onClick={() => toggleOperation("unassigned-" + mod.id)}
                            className="p-0.5 hover:bg-accent rounded"
                          >
                            {expandedOperations.includes("unassigned-" + mod.id) ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                          </button>
                          <span className="text-[11px] font-semibold text-orange-500/80 truncate">
                            Unassigned
                          </span>
                        </div>
                        {expandedOperations.includes("unassigned-" + mod.id) && (
                          <div className="ml-3 space-y-0.5">
                            {mod.unassignedTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => navigateToTaskDetail(task.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors",
                                  selectedTaskId === task.id 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                              >
                                <ListTodo className="h-3 w-3 shrink-0" />
                                <span className="truncate">{task.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                     </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Context Info */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Activity className="h-3 w-3 text-emerald-500" />
          <span className="font-medium">System Active</span>
        </div>
      </div>
    </aside>
  );
}

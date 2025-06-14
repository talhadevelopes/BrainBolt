import { moduleData, ModuleData } from './moduleData';
import { Timestamp } from './hardcodedData';

export interface TimestampModule {
  timestamp: Timestamp;
  module: ModuleData;
  assignedAt: number;
}

class ModuleAssigner {
  private assignments: Map<number, ModuleData> = new Map();
  private usedModules: Set<string> = new Set();  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  
  private getRandomModule(): ModuleData {
    //@ts-ignore

    const availableModules = moduleData.filter(module => !this.usedModules.has(module.id));
    
    if (availableModules.length === 0) {
      // Reset used modules if all have been used
      this.usedModules.clear();
      return moduleData[Math.floor(Math.random() * moduleData.length)];
    }
    
    const shuffled = this.shuffleArray(availableModules);
    const selected = shuffled[0];
    //@ts-ignore
    this.usedModules.add(selected.id);
    
    // Keep only last 3 used modules to allow some repetition
    if (this.usedModules.size > 3) {
      const usedArray = Array.from(this.usedModules);
      this.usedModules = new Set(usedArray.slice(-3));
    }
    
    return selected;
  }

  // Assign modules to timestamps
  assignModulesToTimestamps(timestamps: Timestamp[]): TimestampModule[] {
    return timestamps.map(timestamp => {
      if (!this.assignments.has(timestamp.time)) {
        this.assignments.set(timestamp.time, this.getRandomModule());
      }
      
      return {
        timestamp,
        module: this.assignments.get(timestamp.time)!,
        assignedAt: Date.now()
      };
    });
  }

  // Get module for specific timestamp
  getModuleForTimestamp(time: number): ModuleData | null {
    return this.assignments.get(time) || null;
  }

  // Reassign a specific timestamp (for refresh functionality)
  reassignTimestamp(time: number): ModuleData {
    const newModule = this.getRandomModule();
    this.assignments.set(time, newModule);
    return newModule;
  }

  // Get all current assignments
  getAllAssignments(): TimestampModule[] {
    const assignments: TimestampModule[] = [];
    this.assignments.forEach((module, time) => {
      assignments.push({
        timestamp: { time, title: `Timestamp ${time}` },
        module,
        assignedAt: Date.now()
      });
    });
    return assignments;
  }
}

export const moduleAssigner = new ModuleAssigner();
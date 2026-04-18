import type { TaskRecord } from '../../src/shared/types/task.js';
export declare function createTaskService(): {
    createTask(input: {
        type: string;
        label: string;
        currentStep?: string;
    }): TaskRecord;
    updateTask(taskId: string, patch: Partial<Pick<TaskRecord, "status" | "progress" | "currentStep" | "currentFile" | "etaSeconds" | "errorMessage">>): string | null;
    listTasks(): TaskRecord[];
};

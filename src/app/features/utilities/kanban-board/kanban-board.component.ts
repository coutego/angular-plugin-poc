import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Task {
  id: number;
  title: string;
  description: string;
  column: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  color: string;
}

@Component({
  selector: 'app-kanban-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-full">
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 mb-2">Kanban Board</h1>
            <p class="text-slate-600">Drag and drop tasks to organize your workflow.</p>
          </div>
          <button
            (click)="openAddModal()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">Total Tasks</p>
          <p class="text-2xl font-bold text-slate-900">{{ totalTasks() }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">In Progress</p>
          <p class="text-2xl font-bold text-yellow-600">{{ inProgressCount() }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">Completed</p>
          <p class="text-2xl font-bold text-green-600">{{ completedCount() }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500">High Priority</p>
          <p class="text-2xl font-bold text-red-600">{{ highPriorityCount() }}</p>
        </div>
      </div>

      <!-- Board -->
      <div class="overflow-x-auto pb-4">
        <div class="flex gap-4 min-w-max">
          @for (column of columns; track column.id) {
            <div
              class="flex-shrink-0 w-72 bg-slate-100 rounded-xl p-3 transition-all"
              [class.ring-2]="dragOverColumn() === column.id"
              [class.ring-blue-400]="dragOverColumn() === column.id"
              [class.ring-offset-2]="dragOverColumn() === column.id"
              (dragover)="onDragOver($event, column.id)"
              (dragleave)="onDragLeave()"
              (drop)="onDrop($event, column.id)"
            >
              <div class="flex items-center gap-2 mb-3 px-1">
                <div class="w-3 h-3 rounded-full" [class]="column.color"></div>
                <h3 class="font-semibold text-slate-700">{{ column.title }}</h3>
                <span class="ml-auto text-sm text-slate-400 font-medium bg-white px-2 py-0.5 rounded-full">
                  {{ getTasksForColumn(column.id).length }}
                </span>
              </div>

              <div class="space-y-2 min-h-[200px]">
                @for (task of getTasksForColumn(column.id); track task.id) {
                  <div
                    class="bg-white rounded-lg border border-slate-200 p-3 cursor-grab shadow-sm hover:shadow-md transition-all"
                    [class.opacity-50]="draggingTaskId() === task.id"
                    [class.rotate-2]="draggingTaskId() === task.id"
                    draggable="true"
                    (dragstart)="onDragStart($event, task.id)"
                    (dragend)="onDragEnd()"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium text-slate-900 text-sm leading-tight flex-1 pr-2">
                        {{ task.title }}
                      </h4>
                      <div class="flex gap-1">
                        <button
                          class="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                          (click)="openEditModal(task)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          class="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                          (click)="deleteTask(task.id)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    @if (task.description) {
                      <p class="text-xs text-slate-500 mb-2 line-clamp-2">{{ task.description }}</p>
                    }

                    <div class="flex flex-wrap items-center gap-1.5">
                      <span [class]="getPriorityClass(task.priority)">
                        {{ task.priority }}
                      </span>
                      @for (tag of task.tags; track tag) {
                        <span class="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
                          {{ tag }}
                        </span>
                      }
                    </div>
                  </div>
                }

                @if (getTasksForColumn(column.id).length === 0 && dragOverColumn() !== column.id) {
                  <div class="flex items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-sm">
                    No tasks
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          (click)="closeModal()"
        >
          <div
            class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            (click)="$event.stopPropagation()"
          >
            <h2 class="text-xl font-bold text-slate-900 mb-4">
              {{ editingTask() ? 'Edit Task' : 'Add New Task' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label for="task-title" class="block text-sm font-medium text-slate-700 mb-1">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="task-title"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Task title..."
                  [ngModel]="formTitle()"
                  (ngModelChange)="formTitle.set($event)"
                />
              </div>

              <div>
                <label for="task-description" class="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="task-description"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Task description..."
                  [ngModel]="formDescription()"
                  (ngModelChange)="formDescription.set($event)"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="task-column" class="block text-sm font-medium text-slate-700 mb-1">
                    Column
                  </label>
                  <select
                    id="task-column"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    [ngModel]="formColumn()"
                    (ngModelChange)="formColumn.set($event)"
                  >
                    @for (col of columns; track col.id) {
                      <option [value]="col.id">{{ col.title }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label for="task-priority" class="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    [ngModel]="formPriority()"
                    (ngModelChange)="formPriority.set($event)"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="task-tags" class="block text-sm font-medium text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  id="task-tags"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="design, frontend, urgent"
                  [ngModel]="formTags()"
                  (ngModelChange)="formTags.set($event)"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                (click)="closeModal()"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="!formTitle().trim()"
                (click)="saveTask()"
              >
                {{ editingTask() ? 'Save Changes' : 'Add Task' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class KanbanBoardComponent {
  private readonly router = inject(Router);

  protected readonly columns: Column[] = [
    { id: 'backlog', title: 'Backlog', color: 'bg-slate-500' },
    { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' },
  ];

  protected readonly tasks = signal<Task[]>([
    { id: 1, title: 'Design user interface', description: 'Create wireframes and mockups', column: 'todo', priority: 'high', tags: ['design'] },
    { id: 2, title: 'Set up database', description: 'Configure PostgreSQL and migrations', column: 'in-progress', priority: 'medium', tags: ['backend'] },
    { id: 3, title: 'Write API endpoints', description: 'RESTful API for user management', column: 'backlog', priority: 'high', tags: ['backend', 'api'] },
    { id: 4, title: 'Implement authentication', description: 'JWT-based auth system', column: 'review', priority: 'high', tags: ['security'] },
    { id: 5, title: 'Add unit tests', description: 'Test coverage for core modules', column: 'todo', priority: 'low', tags: ['testing'] },
    { id: 6, title: 'Deploy to staging', description: 'Set up CI/CD pipeline', column: 'done', priority: 'medium', tags: ['devops'] },
    { id: 7, title: 'Code review session', description: 'Review PR #42', column: 'review', priority: 'medium', tags: ['review'] },
    { id: 8, title: 'Update documentation', description: 'API docs and README', column: 'backlog', priority: 'low', tags: ['docs'] },
  ]);

  protected readonly nextId = signal(9);
  protected readonly draggingTaskId = signal<number | null>(null);
  protected readonly dragOverColumn = signal<string | null>(null);
  protected readonly showModal = signal(false);
  protected readonly editingTask = signal<Task | null>(null);

  // Form fields
  protected readonly formTitle = signal('');
  protected readonly formDescription = signal('');
  protected readonly formColumn = signal('backlog');
  protected readonly formPriority = signal<'low' | 'medium' | 'high'>('medium');
  protected readonly formTags = signal('');

  // Computed stats
  protected readonly totalTasks = computed(() => this.tasks().length);
  protected readonly inProgressCount = computed(() => 
    this.tasks().filter(t => t.column === 'in-progress').length
  );
  protected readonly completedCount = computed(() => 
    this.tasks().filter(t => t.column === 'done').length
  );
  protected readonly highPriorityCount = computed(() => 
    this.tasks().filter(t => t.priority === 'high').length
  );

  protected getTasksForColumn(columnId: string): Task[] {
    return this.tasks().filter(t => t.column === columnId);
  }

  protected getPriorityClass(priority: string): string {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded border';
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-700 border-red-200`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-700 border-yellow-200`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-700 border-green-200`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-700 border-slate-200`;
    }
  }

  // Drag and drop handlers
  protected onDragStart(event: DragEvent, taskId: number): void {
    this.draggingTaskId.set(taskId);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(taskId));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  protected onDragEnd(): void {
    this.draggingTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  protected onDragOver(event: DragEvent, columnId: string): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn.set(columnId);
  }

  protected onDragLeave(): void {
    this.dragOverColumn.set(null);
  }

  protected onDrop(event: DragEvent, columnId: string): void {
    event.preventDefault();
    const taskId = this.draggingTaskId();
    if (taskId !== null) {
      this.tasks.update(tasks =>
        tasks.map(task =>
          task.id === taskId ? { ...task, column: columnId } : task
        )
      );
    }
    this.draggingTaskId.set(null);
    this.dragOverColumn.set(null);
  }

  // Modal handlers
  protected openAddModal(): void {
    this.editingTask.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formColumn.set('backlog');
    this.formPriority.set('medium');
    this.formTags.set('');
    this.showModal.set(true);
  }

  protected openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.formTitle.set(task.title);
    this.formDescription.set(task.description);
    this.formColumn.set(task.column);
    this.formPriority.set(task.priority);
    this.formTags.set(task.tags.join(', '));
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingTask.set(null);
  }

  protected saveTask(): void {
    const title = this.formTitle().trim();
    if (!title) return;

    const tags = this.formTags()
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const editing = this.editingTask();
    if (editing) {
      // Update existing task
      this.tasks.update(tasks =>
        tasks.map(task =>
          task.id === editing.id
            ? {
                ...task,
                title,
                description: this.formDescription(),
                column: this.formColumn(),
                priority: this.formPriority(),
                tags,
              }
            : task
        )
      );
    } else {
      // Add new task
      const newTask: Task = {
        id: this.nextId(),
        title,
        description: this.formDescription(),
        column: this.formColumn(),
        priority: this.formPriority(),
        tags,
      };
      this.tasks.update(tasks => [...tasks, newTask]);
      this.nextId.update(id => id + 1);
    }

    this.closeModal();
  }

  protected deleteTask(taskId: number): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
  }
}

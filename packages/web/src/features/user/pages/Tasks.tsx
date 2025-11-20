import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import IconButton from '@/components/ui/IconButton'
import Alert from '@/components/ui/Alert'
import Tabs from '@/components/ui/Tabs'
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  ListTodo,
  Clock,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
}

type TaskFilter = 'all' | 'active' | 'completed'

interface TaskFormData {
  title: string
  description: string
}

interface TaskFormErrors {
  title?: string
  description?: string
}

// ============================================================================
// Initial Mock Data
// ============================================================================

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new task feature',
    completed: false,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    title: 'Review pull requests',
    description: 'Review and merge pending PRs from team members',
    completed: true,
    createdAt: new Date('2025-01-14'),
  },
  {
    id: '3',
    title: 'Update dependencies',
    description: 'Update project dependencies to latest stable versions',
    completed: false,
    createdAt: new Date('2025-01-13'),
  },
]

// ============================================================================
// Main Component
// ============================================================================

const Tasks: React.FC = () => {
  // State Management
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  // ============================================================================
  // Computed Values
  // ============================================================================

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const taskStats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  }

  // ============================================================================
  // Validation
  // ============================================================================

  const validateForm = (): boolean => {
    const errors: TaskFormErrors = {}

    if (!formData.title.trim()) {
      errors.title = 'Task title is required'
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Task title must be at least 3 characters'
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Task title must not exceed 100 characters'
    }

    if (!formData.description.trim()) {
      errors.description = 'Task description is required'
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Task description must be at least 10 characters'
    } else if (formData.description.trim().length > 500) {
      errors.description = 'Task description must not exceed 500 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (formErrors[name as keyof TaskFormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
    })
    setFormErrors({})
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  const handleAddTask = () => {
    if (!validateForm()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      completed: false,
      createdAt: new Date(),
    }

    setTasks((prev) => [newTask, ...prev])
    setSuccessMessage('Task created successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditTask = () => {
    if (!selectedTask || !validateForm()) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              title: formData.title.trim(),
              description: formData.description.trim(),
            }
          : task,
      ),
    )

    setSuccessMessage('Task updated successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
    setIsEditDialogOpen(false)
    setSelectedTask(null)
    resetForm()
  }

  const handleDeleteTask = () => {
    if (!selectedTask) return

    setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id))
    setSuccessMessage('Task deleted successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
    setIsDeleteDialogOpen(false)
    setSelectedTask(null)
  }

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  // ============================================================================
  // Dialog Handlers
  // ============================================================================

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  // ============================================================================
  // Tab Handler
  // ============================================================================

  const handleTabChange = (value: string) => {
    setFilter(value as TaskFilter)
  }

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const renderTaskList = (tasks: Task[]) => {
    if (tasks.length === 0) {
      return (
        <Card.Root padding="lg">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Circle className="h-16 w-16 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-headline mb-2">
              No tasks found
            </h3>
            <p className="text-text mb-4">
              {filter === 'all'
                ? "You don't have any tasks yet. Create one to get started!"
                : `No ${filter} tasks at the moment.`}
            </p>
            {filter === 'all' && (
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={openAddDialog}
              >
                Create Your First Task
              </Button>
            )}
          </div>
        </Card.Root>
      )
    }

    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card.Root key={task.id} padding="md" variant="elevated">
            <div className="flex items-start gap-3">
              {/* Completion Toggle */}
              <button
                onClick={() => handleToggleComplete(task.id)}
                className="mt-0.5 flex-shrink-0 transition-colors"
                aria-label={
                  task.completed ? 'Mark as incomplete' : 'Mark as complete'
                }
              >
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <Circle className="h-6 w-6 text-muted hover:text-primary" />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    task.completed ? 'text-muted line-through' : 'text-headline'
                  }`}
                >
                  {task.title}
                </h3>
                <p
                  className={`text-sm mb-2 ${
                    task.completed ? 'text-muted/70' : 'text-text'
                  }`}
                >
                  {task.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <IconButton
                  icon={<Pencil className="h-4 w-4" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(task)}
                  aria-label="Edit task"
                />
                <IconButton
                  icon={<Trash2 className="h-4 w-4" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteDialog(task)}
                  aria-label="Delete task"
                  className="text-error hover:text-error hover:bg-error/10"
                />
              </div>
            </div>
          </Card.Root>
        ))}
      </div>
    )
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-8 lg:px-12 xl:px-32">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-headline">My Tasks</h1>
            <p className="text-text mt-1">
              Manage your daily tasks and stay organized
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openAddDialog}
          >
            Add Task
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert
            variant="success"
            title={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Tasks Card */}
          <Card.Root padding="md" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-headline">
                  {taskStats.total}
                </p>
                <p className="text-sm text-muted mt-1">Total Tasks</p>
              </div>
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ListTodo className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </Card.Root>

          {/* Active Tasks Card */}
          <Card.Root padding="md" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {taskStats.active}
                </p>
                <p className="text-sm text-muted mt-1">Active Tasks</p>
              </div>
              <div className="flex-shrink-0">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </div>
          </Card.Root>

          {/* Completed Tasks Card */}
          <Card.Root padding="md" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">
                  {taskStats.completed}
                </p>
                <p className="text-sm text-muted mt-1">Completed</p>
              </div>
              <div className="flex-shrink-0">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </div>
          </Card.Root>
        </div>

        {/* Tabs for Task Filtering */}
        <Tabs.Root value={filter} onChange={handleTabChange}>
          <Tabs.List variant="line">
            <Tabs.Tab value="all">All Tasks</Tabs.Tab>
            <Tabs.Tab value="active">Active</Tabs.Tab>
            <Tabs.Tab value="completed">Completed</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel value="all">{renderTaskList(filteredTasks)}</Tabs.Panel>

            <Tabs.Panel value="active">
              {renderTaskList(filteredTasks)}
            </Tabs.Panel>

            <Tabs.Panel value="completed">
              {renderTaskList(filteredTasks)}
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs.Root>

        {/* Add Task Dialog */}
        <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content size="md">
              <Dialog.Header>
                <Dialog.Title>Create New Task</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <div className="space-y-4">
                  <Input
                    label="Task Title"
                    name="title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={formErrors.title}
                    autoFocus
                  />
                  <Input
                    label="Description"
                    name="description"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={formErrors.description}
                  />
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddTask}>
                  Create Task
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Edit Task Dialog */}
        <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content size="md">
              <Dialog.Header>
                <Dialog.Title>Edit Task</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <div className="space-y-4">
                  <Input
                    label="Task Title"
                    name="title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={formErrors.title}
                    autoFocus
                  />
                  <Input
                    label="Description"
                    name="description"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={formErrors.description}
                  />
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedTask(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleEditTask}>
                  Save Changes
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Delete Confirmation Dialog */}
        <Dialog.Root
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content size="sm">
              <Dialog.Header>
                <Dialog.Title>Delete Task</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <p className="text-text">
                  Are you sure you want to delete "{selectedTask?.title}"? This
                  action cannot be undone.
                </p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    setSelectedTask(null)
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteTask}>
                  Delete Task
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </div>
    </div>
  )
}

export default Tasks

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
import { useTasks } from '@/features/user/hooks/useTasks'
import { useTaskMutations } from '@/features/user/hooks/useTaskMutations'
import type { Task } from '@/features/user/services/task.service'

// ============================================================================
// Types
// ============================================================================

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
// Main Component
// ============================================================================

const Tasks: React.FC = () => {
  // State Management
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
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Hooks
  const { tasks, stats, loading, error, refetch, toggleTask } = useTasks({
    status: filter,
  })

  const { createTask, updateTask, deleteTask, isSubmitting } = useTaskMutations(
    {
      onSuccess: (message) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(''), 3000)
        refetch()
      },
      onError: (message) => {
        setErrorMessage(message)
        setTimeout(() => setErrorMessage(''), 5000)
      },
    },
  )

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

  const handleAddTask = async () => {
    if (!validateForm()) return

    const newTask = await createTask(formData)

    if (newTask) {
      setIsAddDialogOpen(false)
      resetForm()
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask || !validateForm()) return

    const updated = await updateTask(selectedTask.id, formData)

    if (updated) {
      setIsEditDialogOpen(false)
      setSelectedTask(null)
      resetForm()
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    const deleted = await deleteTask(selectedTask.id)

    if (deleted) {
      setIsDeleteDialogOpen(false)
      setSelectedTask(null)
    }
  }

  const handleToggleComplete = async (taskId: string) => {
    await toggleTask(taskId)
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const renderTaskList = (tasks: Task[]) => {
    if (loading) {
      return (
        <Card.Root padding="lg">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-text">Loading tasks...</p>
          </div>
        </Card.Root>
      )
    }

    if (error) {
      return (
        <Card.Root padding="lg">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Circle className="h-16 w-16 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-headline mb-2">
              Error Loading Tasks
            </h3>
            <p className="text-text mb-4">{error}</p>
            <Button variant="primary" onClick={refetch}>
              Retry
            </Button>
          </div>
        </Card.Root>
      )
    }

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

        {/* Error Message */}
        {errorMessage && (
          <Alert
            variant="error"
            title={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Tasks Card */}
          <Card.Root padding="md" variant="elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-headline">
                  {stats.total}
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
                  {stats.active}
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
                  {stats.completed}
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
            <Tabs.Panel value="all">{renderTaskList(tasks)}</Tabs.Panel>

            <Tabs.Panel value="active">{renderTaskList(tasks)}</Tabs.Panel>

            <Tabs.Panel value="completed">{renderTaskList(tasks)}</Tabs.Panel>
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddTask}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEditTask}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteTask}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Task'}
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

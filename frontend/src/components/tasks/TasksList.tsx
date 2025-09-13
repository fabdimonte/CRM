import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { CheckSquare, Clock, AlertTriangle, User } from 'lucide-react'
import type { Task } from '@/types'

interface TasksListProps {
  tasks: Task[]
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 border-gray-200',
  doing: 'bg-blue-100 text-blue-800 border-blue-200',
  done: 'bg-green-100 text-green-800 border-green-200',
}

const statusLabels = {
  todo: 'To Do',
  doing: 'In Progress',
  done: 'Done',
}

export function TasksList({ tasks }: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
            <p className="text-muted-foreground">Create tasks to track action items and deadlines.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const colorClass = statusColors[task.status]
        
        return (
          <Card key={task.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                    {statusLabels[task.status]}
                  </div>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  {task.is_overdue && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <Button size="sm" variant="outline">
                  Update Status
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{task.assignee_name}</span>
                  </div>
                  {task.due_at && (
                    <div className={`flex items-center space-x-1 ${
                      task.is_overdue ? 'text-destructive' : ''
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>Due {formatDateTime(task.due_at)}</span>
                    </div>
                  )}
                </div>
                <span>Created by {task.created_by_name}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
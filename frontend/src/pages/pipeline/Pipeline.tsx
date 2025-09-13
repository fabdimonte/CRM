import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { dealsApi } from '@/services/deals-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Building, User, DollarSign, Calendar, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatPercentage, formatDate, isOverdue } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import type { KanbanColumn, KanbanDeal } from '@/types'

export function Pipeline() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: kanbanData = [], isLoading } = useQuery({
    queryKey: ['deals', 'kanban'],
    queryFn: dealsApi.getKanbanData,
  })

  const moveCardMutation = useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: number; stageId: number }) =>
      dealsApi.moveStage(dealId, stageId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast({
        title: 'Deal moved successfully',
        description: 'The deal has been moved to the new stage.',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error moving deal',
        description: error instanceof Error ? error.message : 'Failed to move deal',
      })
    },
  })

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const dealId = parseInt(draggableId.split('-')[1])
    const stageId = parseInt(destination.droppableId.split('-')[1])

    moveCardMutation.mutate({ dealId, stageId })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            Manage and track your M&A deals through the pipeline
          </p>
        </div>
        <Button asChild>
          <Link to="/deals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Link>
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {kanbanData.map((column: KanbanColumn) => (
            <div key={column.stage.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{column.stage.name}</h2>
                <Badge variant="secondary">{column.count}</Badge>
              </div>

              <Droppable droppableId={`stage-${column.stage.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent'
                    }`}
                  >
                    {column.deals.map((deal: KanbanDeal, index: number) => (
                      <Draggable
                        key={deal.id}
                        draggableId={`deal-${deal.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
                              snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                            }`}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium line-clamp-2">
                                <Link
                                  to={`/deals/${deal.id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {deal.title}
                                </Link>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Building className="mr-1 h-3 w-3" />
                                <span className="truncate">{deal.company_name}</span>
                              </div>
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <User className="mr-1 h-3 w-3" />
                                <span className="truncate">{deal.owner_name}</span>
                              </div>

                              {deal.amount_estimate && (
                                <div className="flex items-center text-xs">
                                  <DollarSign className="mr-1 h-3 w-3" />
                                  <span className="font-medium">
                                    {formatCurrency(deal.amount_estimate)}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {formatPercentage(deal.probability)}
                                </Badge>
                                
                                {deal.next_action_at && (
                                  <div className={`flex items-center text-xs ${
                                    deal.is_overdue ? 'text-destructive' : 'text-muted-foreground'
                                  }`}>
                                    {deal.is_overdue && (
                                      <AlertTriangle className="mr-1 h-3 w-3" />
                                    )}
                                    <Calendar className="mr-1 h-3 w-3" />
                                    <span>{formatDate(deal.next_action_at)}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
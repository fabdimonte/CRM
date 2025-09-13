import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dealsApi } from '@/services/deals-api'
import { interactionsApi } from '@/services/interactions-api'
import { documentsApi } from '@/services/documents-api'
import { tasksApi } from '@/services/tasks-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building, User, DollarSign, Calendar, Percent, AlertTriangle, Plus } from 'lucide-react'
import { formatCurrency, formatPercentage, formatDateTime, isOverdue } from '@/lib/utils'
import { InteractionsList } from '@/components/interactions/InteractionsList'
import { DocumentsList } from '@/components/documents/DocumentsList'
import { TasksList } from '@/components/tasks/TasksList'

export function DealDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const dealId = parseInt(id!)

  const { data: deal, isLoading: isDealLoading } = useQuery({
    queryKey: ['deals', dealId],
    queryFn: () => dealsApi.getDeal(dealId),
    enabled: !!dealId,
  })

  const { data: interactions = { results: [] } } = useQuery({
    queryKey: ['interactions', { deal: dealId }],
    queryFn: () => interactionsApi.getInteractions({ deal: dealId.toString() }),
    enabled: !!dealId,
  })

  const { data: documents = { results: [] } } = useQuery({
    queryKey: ['documents', { deal: dealId }],
    queryFn: () => documentsApi.getDocuments({ deal: dealId.toString() }),
    enabled: !!dealId,
  })

  const { data: tasks = { results: [] } } = useQuery({
    queryKey: ['tasks', { deal: dealId }],
    queryFn: () => tasksApi.getTasks({ deal: dealId.toString() }),
    enabled: !!dealId,
  })

  if (isDealLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Deal not found</h2>
        <p className="text-muted-foreground mb-4">The requested deal could not be found.</p>
        <Button onClick={() => navigate('/pipeline')}>
          Back to Pipeline
        </Button>
      </div>
    )
  }

  const company = typeof deal.company === 'object' ? deal.company : null
  const owner = typeof deal.owner === 'object' ? deal.owner : null
  const stage = typeof deal.stage === 'object' ? deal.stage : null

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pipeline')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{deal.title}</h1>
          <p className="text-muted-foreground">Deal Details & Management</p>
        </div>
        <Button>Edit Deal</Button>
      </div>

      {/* Deal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company?.name || deal.company_name}</div>
            {company && (
              <p className="text-xs text-muted-foreground">
                {company.sector} • {company.country}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owner?.full_name || deal.owner_name}</div>
            {owner && (
              <p className="text-xs text-muted-foreground capitalize">{owner.role}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deal.amount_estimate ? formatCurrency(deal.amount_estimate) : 'N/A'}
            </div>
            {deal.expected_value && (
              <p className="text-xs text-muted-foreground">
                Expected: {formatCurrency(deal.expected_value)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probability</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(deal.probability)}</div>
            <p className="text-xs text-muted-foreground">
              Stage: {stage?.name || deal.stage_name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Action & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Stage:</span>
              <Badge variant="secondary">{stage?.name || deal.stage_name}</Badge>
            </div>
            
            {deal.next_action_at && (
              <div className={`flex items-center space-x-2 ${
                deal.is_overdue ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {deal.is_overdue && <AlertTriangle className="h-4 w-4" />}
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Next action: {formatDateTime(deal.next_action_at)}
                  {deal.is_overdue && ' (Overdue)'}
                </span>
              </div>
            )}
          </div>

          {deal.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{deal.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interactions">
            Interactions ({interactions.results.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({documents.results.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({tasks.results.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Interactions</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Interaction
            </Button>
          </div>
          <InteractionsList interactions={interactions.results} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
          <DocumentsList documents={documents.results} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          <TasksList tasks={tasks.results} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
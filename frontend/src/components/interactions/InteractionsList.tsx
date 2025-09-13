import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { MessageCircle, Phone, Users, FileText } from 'lucide-react'
import type { Interaction } from '@/types'

interface InteractionsListProps {
  interactions: Interaction[]
}

const typeIcons = {
  email: MessageCircle,
  call: Phone,
  meeting: Users,
  note: FileText,
}

const typeColors = {
  email: 'bg-blue-100 text-blue-800 border-blue-200',
  call: 'bg-green-100 text-green-800 border-green-200',
  meeting: 'bg-purple-100 text-purple-800 border-purple-200',
  note: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function InteractionsList({ interactions }: InteractionsListProps) {
  if (interactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No interactions yet</h3>
            <p className="text-muted-foreground">Start by adding an interaction to track communications.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => {
        const Icon = typeIcons[interaction.type]
        const colorClass = typeColors[interaction.type]
        
        return (
          <Card key={interaction.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                    <Icon className="mr-1 h-3 w-3" />
                    {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                  </div>
                  <CardTitle className="text-base">{interaction.subject}</CardTitle>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(interaction.occurred_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {interaction.body}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>By {interaction.author_name}</span>
                <span>{interaction.related_entity}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
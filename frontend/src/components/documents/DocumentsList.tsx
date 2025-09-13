import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { FileText, Download, Trash2 } from 'lucide-react'
import type { Document } from '@/types'

interface DocumentsListProps {
  documents: Document[]
}

export function DocumentsList({ documents }: DocumentsListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
            <p className="text-muted-foreground">Upload documents to keep track of important files.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{document.filename}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {document.file_extension.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {document.file_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>{document.size_human}</span>
                <span>Uploaded by {document.uploaded_by_name}</span>
              </div>
              <span>{formatDateTime(document.uploaded_at)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams()
  const workflowId = params.workflowId as string

  // construct webhook URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      toast.success('Webhook URL copied to clipboard')
    } catch {
      toast.error('Failed to copy webhook URL')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL to connect your Stripe account to this trigger.
            Whenever a Stripe event occurs, it will trigger the workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe Dashboard.</li>
              <li>Navigate to Developers = Webhooks.</li>
              <li>Click "Add endpoint" and paste the webhook URL above.</li>
              <li>Select the events you want to listen to.</li>
              <li>Click "Add endpoint" to save.</li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <li>
              <code className='bg-background px-1 py-0.5 rounded'>
                {"{{stripe.amount}}"}
              </code> - Payment amount
            </li>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { NodeType } from '@/generated/prisma'
import { GlobeIcon, MousePointerIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from './ui/sheet'
import Image from 'next/image'
import { Separator } from './ui/separator'
import { useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { createId } from '@paralleldrive/cuid2'

export type NodeTypeOption = {
  type: NodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }> | string
}

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: 'Trigger manually',
    description:
      'Trigger this workflow manually by clicking a button. Good for getting started quickly.',
    icon: MousePointerIcon
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: 'When form is submitted',
    description: 'Runs the workflow when a Google Form is submitted.',
    icon: '/logos/googleform.svg'
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: 'Stripe event',
    description: 'Runs the workflow when a Stripe event happens.',
    icon: '/logos/stripe.svg'
  }
]

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: 'HTTP Request',
    description: 'Make an HTTP request to an external API.',
    icon: GlobeIcon
  }
]

interface NodeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const NodeSelector = ({
  open,
  onOpenChange,
  children
}: NodeSelectorProps) => {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow()

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes()
        const hasManualTrigger = nodes.some(
          node => node.type === NodeType.MANUAL_TRIGGER
        )

        if (hasManualTrigger) {
          toast.error('You can only have one manual trigger per workflow.')
          return
        }
      }

      setNodes(nodes => {
        const hasInitialTrigger = nodes.some(
          node => node.type === NodeType.INITIAL
        )

        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200
        })

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selection.type
        }

        if (hasInitialTrigger) {
          return [newNode]
        }

        return [...nodes, newNode]
      })

      onOpenChange(false)
    },
    [setNodes, getNodes, screenToFlowPosition, onOpenChange]
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-auto">
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            Select a trigger to get started. You can always change this later.
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map(nodeType => {
            const Icon = nodeType.icon

            return (
              <div
                key={nodeType.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === 'string' ? (
                    <Image
                      src={Icon}
                      alt={nodeType.label}
                      className="size-5 object-contain rounded-sm"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Separator />
        <div>
          {executionNodes.map(nodeType => {
            const Icon = nodeType.icon

            return (
              <div
                key={nodeType.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(nodeType)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === 'string' ? (
                    <Image
                      src={Icon}
                      alt={nodeType.label}
                      className="size-5 object-contain rounded-sm"
                      width={25}
                      height={25}
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">
                      {nodeType.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {nodeType.description}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

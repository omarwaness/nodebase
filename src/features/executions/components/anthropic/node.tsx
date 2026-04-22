'use client'

import { type NodeProps, Node, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import { BaseExecutionNode } from '../base-execution-node'
import { AnthropicFormValues, AnthropicDialog } from './dialog'
import { useNodeStatus } from '../../hooks/use-node-status'
import { fetchAnthropicRealtimeToken } from './action'
import { ANTHROPIC_CHANNEL_NAME } from '@/inngest/channels/anthropic'

type AnthropicNodeData = {
  variableName?: string
  systemPrompt?: string
  userPrompt?: string
}

type AnthropicNodeType = Node<AnthropicNodeData>

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchAnthropicRealtimeToken
  })
  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes(nodes =>
      nodes.map(node => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values
            }
          }
        }
        return node
      })
    )
  }

  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `'claude-opus-4-6' ${nodeData.userPrompt.slice(0, 30)}...`
    : 'Not configured'

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

AnthropicNode.displayName = 'AnthropicNode'

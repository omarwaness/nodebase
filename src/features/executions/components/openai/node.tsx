'use client'

import { type NodeProps, Node, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import { BaseExecutionNode } from '../base-execution-node'
import { OpenaiFormValues, OpenaiDialog } from './dialog'
import { useNodeStatus } from '../../hooks/use-node-status'
import { fetchOpenAIRealtimeToken } from './action'
import { OPENAI_CHANNEL_NAME } from '@/inngest/channels/openai'

type OpenaiNodeData = {
  variableName?: string
  systemPrompt?: string
  userPrompt?: string
}

type OpenaiNodeType = Node<OpenaiNodeData>

export const OpenaiNode = memo((props: NodeProps<OpenaiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchOpenAIRealtimeToken
  })
  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (values: OpenaiFormValues) => {
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
    ? `'gpt-4o' ${nodeData.userPrompt.slice(0, 30)}...`
    : 'Not configured'

  return (
    <>
      <OpenaiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

OpenaiNode.displayName = 'OpenaiNode'

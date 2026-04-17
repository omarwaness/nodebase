'use client'

import { type NodeProps, Node, useReactFlow } from '@xyflow/react'
import { memo, useState } from 'react'
import { BaseExecutionNode } from '../base-execution-node'
import { GlobeIcon } from 'lucide-react'
import { HttpRequestFormValues, HttpRequestDialog } from './dialog'
import { useNodeStatus } from '../../hooks/use-node-status'
import { fetchHttpRequestRealtimeToken } from './action'
import { HTTP_REQUEST_CHANNEL_NAME } from '@/inngest/channels/http-request'

type HttpRequestNodeData = {
  variableName?: string
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: string
}

type HttpRequestNodeType = Node<HttpRequestNodeData>

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HTTP_REQUEST_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchHttpRequestRealtimeToken
  })
  const handleOpenSettings = () => setDialogOpen(true)

  const handleSubmit = (values: HttpRequestFormValues) => {
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
  const description = nodeData?.endpoint
    ? `${nodeData.method ?? 'GET'} ${nodeData.endpoint}`
    : 'Not configured'

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="Http Request"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

HttpRequestNode.displayName = 'HttpRequestNode'

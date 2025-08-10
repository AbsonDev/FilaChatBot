import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface MCPStatus {
  connected: boolean;
  queuePosition: number;
  waitTime: number;
  agentsOnline: number;
}

export function useMCPClient() {
  const [mcpStatus, setMcpStatus] = useState(true);
  const [queuePosition, setQueuePosition] = useState(1);
  const [waitTime, setWaitTime] = useState(2);

  // Poll MCP status
  const { data: statusData } = useQuery({
    queryKey: ['/api/mcp/status'],
    refetchInterval: 10000, // Poll every 10 seconds
  });

  useEffect(() => {
    if (statusData && typeof statusData === 'object') {
      const data = statusData as MCPStatus;
      setMcpStatus(data.connected || false);
      setQueuePosition(data.queuePosition || 1);
      setWaitTime(data.waitTime || 1);
    }
  }, [statusData]);

  // Simulate queue position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueuePosition(prev => Math.max(1, prev - Math.floor(Math.random() * 2)));
      setWaitTime(prev => Math.max(1, prev - Math.floor(Math.random() * 2)));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return {
    mcpStatus,
    queuePosition,
    waitTime,
  };
}

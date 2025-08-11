import { useState } from "react";

interface MCPStatus {
  connected: boolean;
  queuePosition: number;
  waitTime: number;
  agentsOnline: number;
}

export function useMCPClient() {
  const [mcpStatus] = useState(true);
  const [queuePosition] = useState(1);
  const [waitTime] = useState(2);

  // Static values - removed polling to avoid excessive API calls
  return {
    mcpStatus,
    queuePosition,
    waitTime,
  };
}

import { useEffect, useState, useRef, useCallback } from 'react';

const WEBSOCKET_URL = 'ws://localhost:9090/api/ws';

export const useWebSocketLogs = (jobId, apiKey = 'batch-api-secret-key') => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!jobId) return;

    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}/jobs/${jobId}/logs/stream?api_key=${apiKey}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket 연결됨: ${jobId}`);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'log') {
            setLogs(prev => [...prev, {
              id: `${data.timestamp}-${Math.random()}`,
              timestamp: data.timestamp,
              level: data.level,
              message: data.message,
              details: data.details,
              historical: data.historical || false
            }]);
          } else if (data.type === 'job_update') {
            if (data.data.progress !== undefined) {
              setProgress(data.data.progress);
            }
            if (data.data.current_step !== undefined) {
              setCurrentStep(data.data.current_step);
            }
          } else if (data.type === 'ping') {
            // 서버에서 ping을 받으면 pong 응답
            ws.send('pong');
          }
        } catch (err) {
          console.error('메시지 파싱 오류:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket 오류:', event);
        setError('WebSocket 연결 오류가 발생했습니다.');
      };

      ws.onclose = (event) => {
        console.log(`WebSocket 연결 종료: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        wsRef.current = null;

        // 재연결 시도
        if (reconnectAttemptsRef.current < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`${timeout}ms 후 재연결 시도...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, timeout);
        } else {
          setError('서버와의 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
        }
      };
    } catch (err) {
      console.error('WebSocket 연결 실패:', err);
      setError('WebSocket 연결에 실패했습니다.');
    }
  }, [jobId, apiKey]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    connect();

    // Heartbeat 설정
    const heartbeatInterval = setInterval(() => {
      sendMessage('ping');
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      disconnect();
    };
  }, [connect, disconnect, sendMessage]);

  return {
    logs,
    isConnected,
    error,
    currentStep,
    progress,
    clearLogs,
    sendMessage
  };
};
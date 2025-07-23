import { useEffect, useState, useRef, useCallback } from 'react';

const WEBSOCKET_URL = 'ws://localhost:9000/api/ws';

export const useWebSocketLogs = (jobId, apiKey = 'batch-api-secret-key') => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const maxReconnectDelay = 30000; // 30초

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
        
        // 연결 성공 메시지
        console.log('배치 작업 로그 스트리밍 연결 성공');
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
        
        // 더 자세한 에러 메시지
        if (!isConnected) {
          setError('배치 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        } else {
          setError('WebSocket 연결 중 오류가 발생했습니다.');
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket 연결 종료: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        wsRef.current = null;

        // 정상적인 종료가 아닌 경우에만 재연결 시도
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), maxReconnectDelay);
          const attemptNumber = reconnectAttemptsRef.current + 1;
          console.log(`재연결 시도 ${attemptNumber}/${maxReconnectAttempts} - ${timeout}ms 후...`);
          
          setError(`연결이 끊어졌습니다. 재연결 시도 중... (${attemptNumber}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, timeout);
        } else if (event.code === 1000) {
          // 정상 종료
          setError(null);
          console.log('WebSocket 연결이 정상적으로 종료되었습니다.');
        } else {
          // 최대 재시도 횟수 초과
          setError('서버와의 연결을 복구할 수 없습니다. 페이지를 새로고침하거나 관리자에게 문의해주세요.');
        }
      };
    } catch (err) {
      console.error('WebSocket 연결 실패:', err);
      setError(`배치 서버 연결 실패: ${err.message || 'Unknown error'}`);
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
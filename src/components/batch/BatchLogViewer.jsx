import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebSocketLogs } from '@/hooks/useWebSocketLogs';
import { Loader2, Download, Trash2, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const LOG_LEVEL_COLORS = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  DEBUG: 'bg-gray-100 text-gray-800'
};

function BatchLogViewer({ jobId, jobType, onClose }) {
  const { logs, isConnected, error, clearLogs, currentStep, progress } = useWebSocketLogs(jobId);
  const scrollAreaRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    // 새 로그가 추가될 때 자동 스크롤
    if (shouldAutoScrollRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    // 스크롤이 하단에서 100px 이내에 있으면 자동 스크롤 활성화
    shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  const handleExportLogs = () => {
    const logText = logs.map(log => 
      `[${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}] [${log.level}] ${log.message}${
        log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''
      }`
    ).join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-job-${jobId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col shadow-none border-0">
      <CardHeader className="flex-shrink-0 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{jobType}</Badge>
            {isConnected ? (
              <Badge variant="success" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                실시간
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                연결 끊김
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              내보내기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              지우기
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
        {currentStep && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>현재 단계: {currentStep}</span>
            {progress > 0 && <span>진행률: {progress.toFixed(1)}%</span>}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full w-full"
          onScroll={handleScroll}
        >
          <div className="p-4 space-y-3">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                {isConnected ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    로그를 기다리는 중...
                  </>
                ) : (
                  '로그가 없습니다.'
                )}
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 ${
                    log.historical ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0 ${LOG_LEVEL_COLORS[log.level] || ''}`}
                    >
                      {log.level}
                    </Badge>
                    <span className="flex-1 break-all">{log.message}</span>
                  </div>
                  {log.details && (
                    <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default BatchLogViewer;
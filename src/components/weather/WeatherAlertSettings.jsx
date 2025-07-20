import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CloudRain, Thermometer, Wind, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

function WeatherAlertSettings() {
  const [settings, setSettings] = useState({
    rainAlert: {
      enabled: true,
      threshold: 60
    },
    temperatureAlert: {
      enabled: true,
      highThreshold: 35,
      lowThreshold: -5
    },
    windAlert: {
      enabled: false,
      threshold: 10
    },
    specialWeatherAlert: {
      enabled: true
    }
  })

  const handleToggle = (alertType) => {
    setSettings(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        enabled: !prev[alertType].enabled
      }
    }))
  }

  const handleThresholdChange = (alertType, field, value) => {
    setSettings(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    // 실제로는 API 호출하여 설정 저장
    toast.success('날씨 알림 설정이 저장되었습니다')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          날씨 알림 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 강수 알림 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudRain className="h-5 w-5 text-blue-600" />
              <Label htmlFor="rain-alert" className="text-base font-medium">
                강수 확률 알림
              </Label>
              {settings.rainAlert.enabled && (
                <Badge variant="secondary">{settings.rainAlert.threshold}% 이상</Badge>
              )}
            </div>
            <Switch
              id="rain-alert"
              checked={settings.rainAlert.enabled}
              onCheckedChange={() => handleToggle('rainAlert')}
            />
          </div>
          {settings.rainAlert.enabled && (
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="rain-threshold" className="text-sm">
                  알림 기준 (%)
                </Label>
                <Input
                  id="rain-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.rainAlert.threshold}
                  onChange={(e) => handleThresholdChange('rainAlert', 'threshold', e.target.value)}
                  className="w-20"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                강수 확률이 설정값 이상인 지역이 발생하면 알림을 받습니다.
              </p>
            </div>
          )}
        </div>

        {/* 온도 알림 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-red-600" />
              <Label htmlFor="temp-alert" className="text-base font-medium">
                극한 온도 알림
              </Label>
              {settings.temperatureAlert.enabled && (
                <div className="flex gap-2">
                  <Badge variant="destructive">고온 {settings.temperatureAlert.highThreshold}°C</Badge>
                  <Badge variant="secondary">저온 {settings.temperatureAlert.lowThreshold}°C</Badge>
                </div>
              )}
            </div>
            <Switch
              id="temp-alert"
              checked={settings.temperatureAlert.enabled}
              onCheckedChange={() => handleToggle('temperatureAlert')}
            />
          </div>
          {settings.temperatureAlert.enabled && (
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="high-temp" className="text-sm">
                    고온 경보 (°C)
                  </Label>
                  <Input
                    id="high-temp"
                    type="number"
                    value={settings.temperatureAlert.highThreshold}
                    onChange={(e) => handleThresholdChange('temperatureAlert', 'highThreshold', e.target.value)}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="low-temp" className="text-sm">
                    저온 경보 (°C)
                  </Label>
                  <Input
                    id="low-temp"
                    type="number"
                    value={settings.temperatureAlert.lowThreshold}
                    onChange={(e) => handleThresholdChange('temperatureAlert', 'lowThreshold', e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                설정된 온도 범위를 벗어나는 지역이 발생하면 알림을 받습니다.
              </p>
            </div>
          )}
        </div>

        {/* 강풍 알림 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wind className="h-5 w-5 text-green-600" />
              <Label htmlFor="wind-alert" className="text-base font-medium">
                강풍 알림
              </Label>
              {settings.windAlert.enabled && (
                <Badge variant="secondary">{settings.windAlert.threshold}m/s 이상</Badge>
              )}
            </div>
            <Switch
              id="wind-alert"
              checked={settings.windAlert.enabled}
              onCheckedChange={() => handleToggle('windAlert')}
            />
          </div>
          {settings.windAlert.enabled && (
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="wind-threshold" className="text-sm">
                  알림 기준 (m/s)
                </Label>
                <Input
                  id="wind-threshold"
                  type="number"
                  min="0"
                  value={settings.windAlert.threshold}
                  onChange={(e) => handleThresholdChange('windAlert', 'threshold', e.target.value)}
                  className="w-20"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                풍속이 설정값 이상인 지역이 발생하면 알림을 받습니다.
              </p>
            </div>
          )}
        </div>

        {/* 특보 알림 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <Label htmlFor="special-alert" className="text-base font-medium">
                기상 특보 알림
              </Label>
            </div>
            <Switch
              id="special-alert"
              checked={settings.specialWeatherAlert.enabled}
              onCheckedChange={() => handleToggle('specialWeatherAlert')}
            />
          </div>
          {settings.specialWeatherAlert.enabled && (
            <div className="ml-8">
              <p className="text-sm text-muted-foreground">
                기상청에서 발표하는 특보(주의보, 경보)가 발령되면 즉시 알림을 받습니다.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full">
            설정 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default WeatherAlertSettings
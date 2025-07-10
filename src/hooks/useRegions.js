import { useMemo } from 'react'
import {
  useGetRegionMapQuery,
  useGetProvincesQuery,
} from '../store/api/regionsApi'

/**
 * 지역 정보를 관리하는 커스텀 훅
 * 기존 하드코딩된 REGION_MAP과 SIGUNGU_MAP을 API로 대체
 */
export function useRegions() {
  const { data: regionMapData, isLoading: isMapLoading } =
    useGetRegionMapQuery()
  const { data: provincesData, isLoading: isProvincesLoading } =
    useGetProvincesQuery()

  // 기존 형태와 호환되는 REGION_MAP 생성
  const regionMap = useMemo(() => {
    if (!regionMapData?.region_map) {
      // 로딩 중이거나 실패 시 기본값 반환
      return {
        1: '서울',
        2: '인천',
        3: '대전',
        4: '대구',
        5: '광주',
        6: '부산',
        7: '울산',
        8: '세종',
        31: '경기도',
        32: '강원도',
        33: '충청북도',
        34: '충청남도',
        35: '경상북도',
        36: '경상남도',
        37: '전라북도',
        38: '전라남도',
        39: '제주',
      }
    }
    return regionMapData.region_map
  }, [regionMapData])

  // 기존 형태와 호환되는 SIGUNGU_MAP 생성
  const sigunguMap = useMemo(() => {
    if (!regionMapData?.sigungu_map) {
      // 로딩 중이거나 실패 시 기본값 반환
      return {}
    }
    return regionMapData.sigungu_map
  }, [regionMapData])

  // Select 옵션용 provinces 데이터
  const provinceOptions = useMemo(() => {
    if (!provincesData) return []
    return provincesData.map((province) => ({
      value: province.region_code,
      label: province.region_name,
    }))
  }, [provincesData])

  return {
    regionMap,
    sigunguMap,
    provinceOptions,
    provinces: provincesData || [],
    isLoading: isMapLoading || isProvincesLoading,
  }
}

/**
 * 특정 지역 코드의 이름을 반환하는 유틸리티 함수
 */
export function useRegionName(regionCode) {
  const { regionMap } = useRegions()
  return regionMap[regionCode] || regionCode
}

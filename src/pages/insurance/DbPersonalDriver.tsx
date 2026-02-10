import React from 'react'

/**
 * DB 개인대리운전 관리 페이지 (dbins.kr 연동 예정)
 *
 * - 위치: 보험상품 > 대리운전 > DB개인대리운전
 * - 역할: dbins.kr(daeri/www) 에서 들어온 가입신청/상담신청 데이터를 조회·관리하는 운영 화면
 * - 현재: 화면 뼈대만 구성, 실제 데이터 연동은 daeri 쪽 API 설계 후 진행
 */

const DbPersonalDriver: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">DB 개인대리운전</h1>
        <p className="text-sm text-muted-foreground">
          dbins.kr 에서 들어온 가입신청/상담신청 데이터를 조회·관리하는 페이지입니다. 현재는 화면 뼈대만
          구성된 상태이며, 이후 daeri 백엔드(API) 연동 후 실제 데이터가 표시됩니다.
        </p>
      </header>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold mb-4">데이터 연동 예정</h2>
        <p className="text-sm text-muted-foreground">
          우선 메뉴와 페이지 경로만 연결해 둔 상태입니다. 다음 단계에서 daeri(www) 쪽에 조회용 API를
          설계·구현한 뒤, 이 페이지에서 호출하여 가입/상담 데이터를 표 형태로 표시할 예정입니다.
        </p>
      </div>
    </div>
  )
}

export default DbPersonalDriver


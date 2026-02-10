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
        <h2 className="text-base font-semibold mb-4">가입신청 목록 (스키마 미리보기)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          daeri/www 의 <code>applications</code> 테이블(비민감 컬럼)을 그대로 보는 용도로 시작합니다. 아래
          컬럼들은 DB 스키마 기준이며, 이후 실제 데이터는
          <code>/api/admin-applications.php</code>
          에서 가져와 표시할 예정입니다.
        </p>

        <div className="overflow-x-auto rounded-lg border border-dashed border-border bg-background/40">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">created_at</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">insurance_type</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">phone</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">yearly_premium</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">first_premium</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">address</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">address_detail</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">is_same_person</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">contractor_name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">contractor_phone</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">bank_name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">consent_privacy</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">ip</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">user_agent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 text-muted-foreground" colSpan={15}>
                  실제 데이터 연동 후 이 영역에 가입신청 리스트가 표시됩니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DbPersonalDriver


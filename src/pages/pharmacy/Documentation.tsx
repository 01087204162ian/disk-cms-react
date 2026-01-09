import { useEffect, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export default function Documentation() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDocumentation = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // README.md 파일을 fetch로 로드
        const response = await fetch('/docs/pharmacy/README.md')
        
        if (!response.ok) {
          throw new Error(`문서를 불러올 수 없습니다: ${response.status}`)
        }
        
        const text = await response.text()
        setContent(text)
      } catch (err) {
        console.error('문서 로드 오류:', err)
        setError(err instanceof Error ? err.message : '문서를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadDocumentation()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">문서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">문서 로드 오류</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-4">
            파일 경로: /docs/pharmacy/README.md
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8 border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">약국배상책임보험 시스템 문서</h1>
        </div>
        <p className="text-gray-600">시스템 사용 가이드 및 기술 문서</p>
      </div>

      {/* Markdown 콘텐츠 */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            // 코드 블록 스타일링
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              )
            },
            // 링크 스타일링
            a: ({ node, ...props }: any) => (
              <a
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            // 테이블 스타일링
            table: ({ node, ...props }: any) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300" {...props} />
              </div>
            ),
            th: ({ node, ...props }: any) => (
              <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold" {...props} />
            ),
            td: ({ node, ...props }: any) => (
              <td className="border border-gray-300 px-4 py-2" {...props} />
            ),
            // 목록 스타일링
            ul: ({ node, ...props }: any) => (
              <ul className="list-disc list-inside my-4 space-y-2" {...props} />
            ),
            ol: ({ node, ...props }: any) => (
              <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
            ),
            // 제목 스타일링
            h1: ({ node, ...props }: any) => (
              <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b" {...props} />
            ),
            h2: ({ node, ...props }: any) => (
              <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
            ),
            h3: ({ node, ...props }: any) => (
              <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
            ),
            h4: ({ node, ...props }: any) => (
              <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />
            ),
            // 블록쿼트 스타일링
            blockquote: ({ node, ...props }: any) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

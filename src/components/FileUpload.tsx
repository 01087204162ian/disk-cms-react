import React, { useState, useRef } from 'react'
import { Upload, X, Download, File as FileIcon } from 'lucide-react'
import { useToastHelpers } from './Toast'

export interface FileUploadItem {
  id: string | number
  filename: string
  fileType?: string
  fileTypeName?: string
  uploadedAt?: string
  downloadUrl?: string
}

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  fileTypeOptions?: Array<{ value: string; label: string }>
  uploadedFiles?: FileUploadItem[]
  onUpload?: (file: File, fileType?: string) => Promise<void>
  onDelete?: (fileId: string | number) => Promise<void>
  onDownload?: (fileId: string | number, filename: string) => void
  disabled?: boolean
  className?: string
}

export default function FileUpload({
  accept = '*/*',
  multiple = false,
  maxSize = 10,
  fileTypeOptions,
  uploadedFiles = [],
  onUpload,
  onDelete,
  onDownload,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileType, setSelectedFileType] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToastHelpers()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 확인
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`파일 크기는 ${maxSize}MB 이하여야 합니다.`)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('파일을 선택해주세요.')
      return
    }

    if (fileTypeOptions && fileTypeOptions.length > 0 && !selectedFileType) {
      toast.warning('파일 종류를 선택해주세요.')
      return
    }

    try {
      setUploading(true)
      if (onUpload) {
        await onUpload(selectedFile, selectedFileType || undefined)
        setSelectedFile(null)
        setSelectedFileType('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast.success('파일이 업로드되었습니다.')
      }
    } catch (error: any) {
      toast.error(error?.message || '파일 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string | number) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return

    try {
      if (onDelete) {
        await onDelete(fileId)
        toast.success('파일이 삭제되었습니다.')
      }
    } catch (error: any) {
      toast.error(error?.message || '파일 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleDownload = (fileId: string | number, filename: string) => {
    if (onDownload) {
      onDownload(fileId, filename)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 파일 선택 영역 */}
      <div className="flex flex-wrap gap-2 items-end">
        {fileTypeOptions && fileTypeOptions.length > 0 && (
          <div className="w-[150px]">
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled || uploading}
            >
              <option value="">파일 종류 선택</option>
              {fileTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={disabled || uploading || !selectedFile}
          className="px-4 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <Upload className="w-4 h-4" />
          {uploading ? '업로드 중...' : '업로드'}
        </button>
      </div>

      {/* 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-medium">No</th>
                <th className="px-3 py-2 text-left font-medium">파일명</th>
                {fileTypeOptions && fileTypeOptions.length > 0 && (
                  <th className="px-3 py-2 text-left font-medium">파일종류</th>
                )}
                <th className="px-3 py-2 text-left font-medium">업로드일</th>
                <th className="px-3 py-2 text-center font-medium">다운로드</th>
                <th className="px-3 py-2 text-center font-medium">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {uploadedFiles.map((file, index) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-gray-400" />
                    <span>{file.filename}</span>
                  </td>
                  {fileTypeOptions && fileTypeOptions.length > 0 && (
                    <td className="px-3 py-2">{file.fileTypeName || '-'}</td>
                  )}
                  <td className="px-3 py-2 text-gray-600">
                    {file.uploadedAt
                      ? new Date(file.uploadedAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDownload(file.id, file.filename)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

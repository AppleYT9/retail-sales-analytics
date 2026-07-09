'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Upload, CheckCircle, AlertCircle, File } from 'lucide-react'
import Papa from 'papaparse'
import { apiClient } from '@/lib/api-client'

interface UploadStatus {
  filename: string
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
  uploadedRecords?: number
}

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<any[] | null>(null)

  const handleFile = async (file: File) => {
    if (!file) return

    const filename = file.name
    setUploadStatus({ filename, status: 'uploading' })
    setPreview(null)

    try {
      // Show preview for CSV files
      if (file.type === 'text/csv' || filename.endsWith('.csv')) {
        Papa.parse(file, {
          complete: (results) => {
            setPreview(results.data.slice(0, 5))
          },
          header: false,
        })
      }

      // Upload to backend
      const response = await apiClient.uploadSalesData(file)

      if (response.success) {
        setUploadStatus({
          filename,
          status: 'success',
          uploadedRecords: response.data?.uploadedRecords || 0,
        })
      } else {
        setUploadStatus({
          filename,
          status: 'error',
          error: response.error || 'Upload failed',
        })
      }
    } catch (error) {
      setUploadStatus({
        filename,
        status: 'error',
        error: 'Upload failed. Please try again.',
      })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Upload Sales Data</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Zone */}
        <div className="bg-card border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleChange}
            className="hidden"
          />

          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {dragActive ? 'Drop your file here' : 'Drag and drop your sales data'}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, Excel, JSON
          </p>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              {uploadStatus.status === 'success' && (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              )}
              {uploadStatus.status === 'error' && (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              {uploadStatus.status === 'uploading' && (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0 mt-1" />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{uploadStatus.filename}</h3>
                {uploadStatus.status === 'success' && (
                  <p className="text-sm text-green-600">
                    ✓ Successfully uploaded {uploadStatus.uploadedRecords} records
                  </p>
                )}
                {uploadStatus.status === 'error' && (
                  <p className="text-sm text-red-600">{uploadStatus.error}</p>
                )}
                {uploadStatus.status === 'uploading' && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {preview && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Data Preview</h3>
            <div className="bg-card border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className={idx === 0 ? 'bg-muted' : 'border-b border-border'}>
                      {Array.isArray(row) &&
                        row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`px-4 py-3 text-foreground ${
                              idx === 0 ? 'font-semibold text-muted-foreground' : ''
                            }`}
                          >
                            {String(cell || '').substring(0, 50)}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <File className="w-8 h-8 text-primary mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Expected Format</h4>
            <p className="text-sm text-muted-foreground">
              Your CSV should include: Date, Category, Product, Quantity, Price, Region
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Upload className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-semibold text-foreground mb-2">File Size</h4>
            <p className="text-sm text-muted-foreground">
              Maximum file size: 50MB. Unlimited uploads per month.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Data Security</h4>
            <p className="text-sm text-muted-foreground">
              Your data is encrypted and stored securely. We never share your data.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

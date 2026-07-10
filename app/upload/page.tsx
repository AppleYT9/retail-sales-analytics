'use client'

import { useEffect, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, File, Clock, Trash2, Eye, Loader2, ArrowRight } from 'lucide-react'
// @ts-ignore
import Papa from 'papaparse'
import { apiClient } from '@/lib/api-client'
import { PageHeader } from '@/components/PageHeader'

interface UploadStatus {
  filename: string
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
  uploadedRecords?: number
}

interface UploadRecord {
  id: number
  filename: string
  status: string
  records_processed: number
  uploaded_at: string
}

const systemFields = [
  { key: 'date_col', label: 'Order Date', required: true, description: 'Transaction date', aliases: ['date', 'order_date', 'transaction_date', 'timestamp'] },
  { key: 'category_col', label: 'Product Category', required: true, description: 'Category of product', aliases: ['category', 'product_category', 'item_category', 'type'] },
  { key: 'product_col', label: 'Product SKU/Name', required: true, description: 'Product name or SKU code', aliases: ['product', 'product_name', 'item', 'item_name', 'title', 'sku', 'style', 'asin'] },
  { key: 'quantity_col', label: 'Quantity', required: true, description: 'Quantity sold', aliases: ['quantity', 'qty', 'quantity_ordered', 'units', 'count'] },
  { key: 'total_col', label: 'Total Amount / Revenue', required: true, description: 'Total price or revenue of the order', aliases: ['total_amount', 'total_price', 'revenue', 'total', 'amount', 'sales', 'grand_total'] },
  { key: 'region_col', label: 'Region', required: false, description: 'Shipping region or state', aliases: ['region', 'ship_state', 'state', 'ship_city', 'city', 'location', 'country'] },
]

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<any[] | null>(null)
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([])
  
  // Selection and file preview state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loadingPreviewId, setLoadingPreviewId] = useState<number | null>(null)
  const [activeFilePreview, setActiveFilePreview] = useState<{
    filename: string
    records_processed: number
    uploaded_at: string
    data: any[]
  } | null>(null)

  // Column Mapping states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [isMapping, setIsMapping] = useState(false)

  useEffect(() => {
    loadUploadHistory()
  }, [])

  const loadUploadHistory = async () => {
    const response = await apiClient.getUploadHistory()
    if (response.success && response.data) {
      setUploadHistory(response.data)
      window.dispatchEvent(new Event('uploadHistoryRefreshed'))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(uploadHistory.map(u => u.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeleteOne = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file and all its associated sales data?')) return
    
    try {
      const response = await apiClient.deleteUpload(id)
      if (response.success) {
        setSelectedIds(prev => prev.filter(item => item !== id))
        
        // Remove preview if the deleted file was previewed
        const filename = uploadHistory.find(u => u.id === id)?.filename
        if (activeFilePreview && activeFilePreview.filename === filename) {
          setActiveFilePreview(null)
        }
        
        loadUploadHistory()
      } else {
        alert(response.error || 'Failed to delete upload')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete upload')
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected files and all their associated sales data?`)) return
    
    try {
      const response = await apiClient.bulkDeleteUploads(selectedIds)
      if (response.success) {
        // Clear active preview if the previewed file was deleted
        const deletedFilenames = uploadHistory.filter(u => selectedIds.includes(u.id)).map(u => u.filename)
        if (activeFilePreview && deletedFilenames.includes(activeFilePreview.filename)) {
          setActiveFilePreview(null)
        }
        setSelectedIds([])
        loadUploadHistory()
      } else {
        alert(response.error || 'Failed to delete selected uploads')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete selected uploads')
    }
  }

  const handleOpenData = async (id: number) => {
    setLoadingPreviewId(id)
    try {
      const response = await apiClient.getUploadData(id)
      if (response.success && response.data) {
        setActiveFilePreview({
          filename: response.data.filename,
          records_processed: response.data.records_processed,
          uploaded_at: response.data.uploaded_at,
          data: response.data.data
        })
        // Clear local file parse preview to prevent confusion
        setPreview(null)
      } else {
        alert(response.error || 'Failed to open file data')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to open file data')
    } finally {
      setLoadingPreviewId(null)
    }
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setSelectedFile(file)
    setPreview(null)
    setActiveFilePreview(null)

    // Check if CSV to parse headers
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        preview: 2,
        complete: (results: any) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0].map((h: string) => h.trim())
            setCsvHeaders(headers)
            
            // Auto-match headers based on system field aliases
            const initialMapping: Record<string, string> = {}
            systemFields.forEach(field => {
              const matchedHeader = headers.find((h: string) => {
                const normHeader = h.toLowerCase().replace(/[\s-_]/g, '')
                return field.aliases.some(alias => {
                  const normAlias = alias.toLowerCase().replace(/[\s-_]/g, '')
                  return normHeader === normAlias || normHeader.includes(normAlias)
                })
              })
              if (matchedHeader) {
                initialMapping[field.key] = matchedHeader
              }
            })
            setColumnMapping(initialMapping)
            setIsMapping(true)
          } else {
            // Empty file fallback
            uploadDirectly(file)
          }
        },
        header: false,
      })
    } else {
      // Excel files: bypass client mapping or let them choose mapping fields via text inputs
      setCsvHeaders([])
      setColumnMapping({})
      setIsMapping(true)
    }
  }

  const uploadDirectly = async (file: File, mappingOverride?: Record<string, string>) => {
    const filename = file.name
    setUploadStatus({ filename, status: 'uploading' })
    setIsMapping(false)

    try {
      const response = await apiClient.uploadSalesData(file, mappingOverride)
      if (response.success) {
        setUploadStatus({
          filename,
          status: 'success',
          uploadedRecords: response.data?.uploadedRecords || 0,
        })
        loadUploadHistory()
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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <PageHeader 
        title="Upload Sales Data" 
        description="Drag and drop CSV or Excel files to ingest raw sales data into your analytics database."
      />

      <main className="py-4">
        {/* Upload Zone & Mapping UI Switch */}
        {!isMapping ? (
          <div className="bg-card border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer shadow-sm"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
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
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        ) : (
          /* Interactive Column Mapping Panel */
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <File className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Configure Column Mappings</h3>
                <p className="text-xs text-muted-foreground">
                  We found these headers in <span className="font-semibold text-foreground">{selectedFile?.name}</span>. Confirm or map them to system fields below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {systemFields.map((field) => {
                const mappedVal = columnMapping[field.key] || ''
                return (
                  <div key={field.key} className="space-y-2 p-3 bg-muted/20 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 font-bold">*</span>}
                      </label>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{field.description}</span>
                    </div>

                    {csvHeaders.length > 0 ? (
                      /* Dropdown selector for CSV headers */
                      <select
                        value={mappedVal}
                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                      >
                        <option value="">-- Select Column --</option>
                        {csvHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    ) : (
                      /* Text input fallback for Excel files without client header parsing */
                      <input
                        type="text"
                        value={mappedVal}
                        placeholder={`E.g., ${field.aliases[0]}`}
                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setIsMapping(false)
                  setSelectedFile(null)
                }}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedFile && uploadDirectly(selectedFile, columnMapping)}
                className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm & Import
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {uploadStatus && (
          <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
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

        {/* Upload History */}
        {uploadHistory.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upload History
              </h3>
              
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="px-4 py-3 text-left w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-border w-4 h-4 cursor-pointer"
                        checked={uploadHistory.length > 0 && selectedIds.length === uploadHistory.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-semibold">File</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-semibold">Records</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-semibold">Date</th>
                    <th className="px-4 py-3 text-right text-muted-foreground font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.map((upload) => {
                    const isSelected = selectedIds.includes(upload.id)
                    const isLoadingPreview = loadingPreviewId === upload.id
                    
                    return (
                      <tr key={upload.id} className={`border-b border-border transition-colors hover:bg-muted/10 ${isSelected ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            className="rounded border-border w-4 h-4 cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(upload.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium flex items-center gap-2">
                          <File className="w-4 h-4 text-muted-foreground" />
                          {upload.filename}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            upload.status === 'SUCCESS' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {upload.status === 'SUCCESS' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {upload.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{upload.records_processed.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(upload.uploaded_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleOpenData(upload.id)}
                              disabled={isLoadingPreview || upload.status !== 'SUCCESS'}
                              className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors cursor-pointer"
                              title="Open File Data"
                            >
                              {isLoadingPreview ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteOne(upload.id)}
                              className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active File Preview (from History) */}
        {activeFilePreview && (
          <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <File className="w-5 h-5 text-primary" />
                  {activeFilePreview.filename}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded at {new Date(activeFilePreview.uploaded_at).toLocaleString()} &bull; {activeFilePreview.records_processed} total records
                </p>
              </div>
              <button
                onClick={() => setActiveFilePreview(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            
            <div className="overflow-x-auto max-h-[400px] border border-border rounded-lg shadow-inner">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted border-b border-border z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold">Date</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold">Product Name</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold">Category</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold">Customer</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold">Region</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold font-mono">Qty</th>
                    <th className="px-4 py-2.5 text-left text-muted-foreground font-semibold font-mono">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {activeFilePreview.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground italic">
                        No preview records found.
                      </td>
                    </tr>
                  ) : (
                    activeFilePreview.data.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-foreground">
                          {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-2.5 text-foreground font-medium">{order.product_name}</td>
                        <td className="px-4 py-2.5 text-foreground">{order.category}</td>
                        <td className="px-4 py-2.5 text-foreground font-mono text-xs">{order.customer_code}</td>
                        <td className="px-4 py-2.5 text-foreground">{order.region}</td>
                        <td className="px-4 py-2.5 text-foreground font-mono">{order.quantity}</td>
                        <td className="px-4 py-2.5 text-foreground font-mono font-medium">
                          ${order.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <File className="w-8 h-8 text-primary mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Expected Format</h4>
            <p className="text-sm text-muted-foreground">
              Your CSV should include: Date, Category, Product, Quantity, Price, Region
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <Upload className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-semibold text-foreground mb-2">File Size</h4>
            <p className="text-sm text-muted-foreground">
              Maximum file size: 50MB. Unlimited uploads per month.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
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

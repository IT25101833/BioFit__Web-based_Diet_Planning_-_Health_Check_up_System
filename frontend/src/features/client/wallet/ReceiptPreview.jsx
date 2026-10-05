import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import { fetchReceiptBlob } from './data/walletData'

export default function ReceiptPreview({
  file,
  remotePath,
  fileName,
  uploadedLabel,
  onReplace,
  onRemove,
  allowChanges = false,
}) {
  const [localUrl, setLocalUrl] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [remoteType, setRemoteType] = useState('')
  const [error, setError] = useState('')

  const name = file?.name || fileName || 'Receipt'
  const type = file?.type || remoteType || ''
  const previewUrl = localUrl || remoteUrl
  const isImage = type.startsWith('image/') || /\.(jpe?g|png)$/i.test(name)
  const isPdf = type.includes('pdf') || /\.pdf$/i.test(name)

  useEffect(() => {
    if (!file) {
      setLocalUrl('')
      return undefined
    }
    const url = URL.createObjectURL(file)
    setLocalUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (file || !remotePath) return undefined
    let cancelled = false
    let objectUrl = ''
    fetchReceiptBlob(remotePath)
      .then(({ blob, type: contentType }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setRemoteUrl(objectUrl)
        setRemoteType(contentType || blob.type || '')
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Unable to open this receipt.')
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file, remotePath])

  function openReceipt() {
    if (!previewUrl) return
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="rounded-2xl border border-[#eef2f0] p-4">
      <p className="text-[12px] font-medium text-[#8b93a1]">Receipt</p>
      {isImage && previewUrl ? (
        <img src={previewUrl} alt="Receipt preview" className="mt-3 max-h-64 rounded-xl object-contain" />
      ) : null}
      {isPdf ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-[#111827]">{name}</p>
          <Button size="sm" variant="outline" className="!text-[#005a40]" onClick={openReceipt} disabled={!previewUrl}>
            View Receipt
          </Button>
        </div>
      ) : null}
      {!isImage && !isPdf ? <p className="mt-3 text-sm font-semibold text-[#111827]">{name}</p> : null}
      {isImage ? <p className="mt-2 text-sm font-semibold text-[#111827]">{name}</p> : null}
      {uploadedLabel ? <p className="mt-1 text-[12px] text-[#6b7280]">Uploaded: {uploadedLabel}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {allowChanges ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#e8ecf1] px-4 py-2 text-sm font-semibold text-[#005a40]">
            Replace
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="sr-only"
              onChange={(event) => onReplace?.(event.target.files?.[0] || null)}
            />
          </label>
          {onRemove ? (
            <Button size="sm" variant="outline" onClick={onRemove}>
              Remove
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

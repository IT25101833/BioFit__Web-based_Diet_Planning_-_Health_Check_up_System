import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  confirming = false,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={confirming ? undefined : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            disabled={confirming}
            onClick={onClose}
            className="!border-[var(--bf-border)] !bg-[var(--bf-surface)] !text-[var(--bf-muted)] !shadow-[var(--bf-shadow-out)]"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={confirming}
            onClick={onConfirm}
            className={
              tone === 'danger'
                ? '!border-[#f0d0d0] !bg-[#fde8e8] !text-[#c45c5c] !shadow-[var(--bf-shadow-out)] hover:!bg-[#fadada]'
                : '!bg-[#005a40] !text-white !shadow-[var(--bf-shadow-out)] hover:!bg-[#004833]'
            }
          >
            {confirming ? 'Please wait…' : confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}

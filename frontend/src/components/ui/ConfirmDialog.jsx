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
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="!border-[#e8ecf1] !text-[#4b5563]">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={
              tone === 'danger'
                ? '!bg-[#b45309] !text-white hover:!bg-[#92400e]'
                : '!bg-[#005a40] !text-white hover:!bg-[#004833]'
            }
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}

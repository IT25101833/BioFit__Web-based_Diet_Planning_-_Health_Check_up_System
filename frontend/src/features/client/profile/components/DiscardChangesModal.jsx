import Button from '../../../../components/ui/Button'
import Modal from '../../../../components/ui/Modal'

export default function DiscardChangesModal({ open, onContinue, onDiscard }) {
  return (
    <Modal
      open={open}
      onClose={onContinue}
      title="Discard Unsaved Changes?"
      description="The changes you made to your profile have not been saved."
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl !border-[#cfd8e3] !text-[#374151]"
            onClick={onContinue}
          >
            Continue Editing
          </Button>
          <Button
            type="button"
            className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            onClick={onDiscard}
          >
            Discard Changes
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[#6b7280]">
        You can continue editing or discard your changes and return to your
        profile.
      </p>
    </Modal>
  )
}

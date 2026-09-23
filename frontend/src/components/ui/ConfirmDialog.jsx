import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Stack } from '../layout';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {description && <p className="text-sm text-text-secondary mb-6">{description}</p>}
      <Stack direction="row" justify="end" spacing="md">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </Stack>
    </Modal>
  );
};

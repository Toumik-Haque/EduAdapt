import { createContext, useContext, useState, useCallback } from 'react'

const ModalContext = createContext()

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info' | 'success' | 'warning' | 'danger' | 'confirm'
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null
  })

  const showAlert = useCallback((message, title = 'Notice', type = 'info') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText: 'Got It',
        cancelText: null,
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  const showConfirm = useCallback((message, title = 'Please Confirm', type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setModalState((prev) => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}

      {/* Global Dialog Modal */}
      {modalState.isOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 110000
          }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 rounded-4 shadow-xl p-4 bg-white animate-fade-in">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor:
                      modalState.type === 'danger'
                        ? 'var(--rose-50)'
                        : modalState.type === 'warning'
                        ? 'var(--amber-50)'
                        : modalState.type === 'success'
                        ? 'var(--emerald-50)'
                        : 'var(--brand-50)',
                    color:
                      modalState.type === 'danger'
                        ? 'var(--rose-500)'
                        : modalState.type === 'warning'
                        ? 'var(--amber-500)'
                        : modalState.type === 'success'
                        ? 'var(--emerald-500)'
                        : 'var(--brand-700)'
                  }}
                >
                  <i
                    className={`bi fs-5 ${
                      modalState.type === 'danger'
                        ? 'bi-exclamation-octagon-fill'
                        : modalState.type === 'warning'
                        ? 'bi-exclamation-triangle-fill'
                        : modalState.type === 'success'
                        ? 'bi-check-circle-fill'
                        : 'bi-info-circle-fill'
                    }`}
                  ></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{modalState.title}</h6>
                  <span className="text-muted small">EduAdapt System Alert</span>
                </div>
              </div>

              <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                {modalState.message}
              </p>

              <div className="d-flex justify-content-end gap-2">
                {modalState.cancelText && (
                  <button
                    onClick={() => {
                      if (modalState.onCancel) modalState.onCancel()
                      else closeModal()
                    }}
                    className="btn btn-sm btn-light border rounded-pill px-3"
                  >
                    {modalState.cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modalState.onConfirm) modalState.onConfirm()
                    else closeModal()
                  }}
                  className={`btn btn-sm rounded-pill px-4 fw-semibold ${
                    modalState.type === 'danger'
                      ? 'btn-danger'
                      : modalState.type === 'warning'
                      ? 'btn-warning text-dark'
                      : 'btn-primary'
                  }`}
                  style={{
                    backgroundColor:
                      modalState.type === 'danger'
                        ? '#DC2626'
                        : modalState.type === 'warning'
                        ? '#F59E0B'
                        : 'var(--brand-700)',
                    borderColor: 'transparent',
                    color: modalState.type === 'warning' ? '#000000' : '#FFFFFF'
                  }}
                >
                  {modalState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

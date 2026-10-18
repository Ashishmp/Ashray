import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Check, ArrowRight, UserPlus, LogOut, Shield } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';

interface SwitchOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogoutConfirm?: () => void;
}

export const SwitchOwnerModal: React.FC<SwitchOwnerModalProps> = ({
  isOpen,
  onClose,
  onOpenLogoutConfirm
}) => {
  const { currentOwner, registeredOwners, switchOwner, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSwitch = (ownerId: string, ownerName: string, businessName: string) => {
    if (currentOwner?.id === ownerId) {
      onClose();
      return;
    }

    const result = switchOwner(ownerId);
    if (result.success) {
      showToast('Switched Owner Account', `Now managing ${businessName} as ${ownerName}.`, 'success');
      onClose();
    } else {
      showToast('Switch Failed', result.error || 'Could not switch account.', 'error');
    }
  };

  const handleAddOrRegister = () => {
    onClose();
    navigate('/login', { state: { defaultTab: 'register' } });
  };

  const handleLogoutAndLogin = () => {
    onClose();
    if (onOpenLogoutConfirm) {
      onOpenLogoutConfirm();
    } else {
      logout();
      showToast('Signed Out', 'You have been logged out of your session.', 'info');
      navigate('/login');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Owner Account"
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          Seamlessly switch between multiple PG owners to manage independent properties, rooms, tenants, and collections.
        </p>

        {/* List of Owners */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {registeredOwners.map(owner => {
            const isActive = currentOwner?.id === owner.id;
            const properties = storageService.getProperties(owner.id);
            const tenants = storageService.getTenants(owner.id);

            return (
              <div
                key={owner.id}
                onClick={() => handleSwitch(owner.id, owner.name, owner.businessName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: isActive
                    ? '2px solid var(--primary-500)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--primary-50)' : 'var(--bg-surface)',
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  boxShadow: isActive ? '0 0 0 1px var(--primary-500)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--primary-600)' : 'var(--slate-200)',
                      color: isActive ? '#ffffff' : 'var(--slate-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    {owner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {owner.name}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--success-500)',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Check size={12} /> Active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--primary-700)', fontWeight: 600, marginTop: '2px' }}>
                      {owner.businessName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {owner.email} • {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} • {tenants.length} Tenants
                    </div>
                  </div>
                </div>

                <div>
                  {isActive ? (
                    <span style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600 }}>
                      Current
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitch(owner.id, owner.name, owner.businessName);
                      }}
                      icon={<ArrowRight size={14} />}
                      iconPosition="right"
                    >
                      Switch
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            marginTop: '8px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddOrRegister}
            icon={<UserPlus size={15} />}
          >
            Register New Owner
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleLogoutAndLogin}
            icon={<LogOut size={15} />}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};

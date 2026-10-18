import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCheck,
  Send,
  MessageSquare,
  Wrench,
  Info,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { NavRoute } from './Sidebar';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: NavRoute) => void;
  onNotificationRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onNotificationRead,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'reminders'>('all');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [sentReminderText, setSentReminderText] = useState<string | null>(null);

  const fetchNotifs = async () => {
    const list = await api.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    fetchNotifs();
    onNotificationRead();
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifs();
    onNotificationRead();
  };

  const handleSendWhatsAppReminder = (residentName: string, amount: string) => {
    setIsSendingWhatsApp(true);
    setTimeout(() => {
      setIsSendingWhatsApp(false);
      setSentReminderText(`Sent WhatsApp reminder to ${residentName} for ${amount}`);
      setTimeout(() => setSentReminderText(null), 4000);
    }, 800);
  };

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#24211F]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E8E1D9] shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E8E1D9] bg-[#FFFEFC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#B85C38]" />
              <h2 className="text-base font-semibold text-[#24211F]">Notification Center</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-[#716A63] hover:text-[#B85C38] font-medium flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-[#716A63] hover:text-[#24211F] p-1.5 rounded-lg hover:bg-[#F8F6F2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-3 border-b border-[#E8E1D9] flex items-center gap-4 bg-[#FFFEFC] text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-[#B85C38] text-[#B85C38] font-semibold'
                  : 'border-transparent text-[#716A63] hover:text-[#24211F]'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'unread'
                  ? 'border-[#B85C38] text-[#B85C38] font-semibold'
                  : 'border-transparent text-[#716A63] hover:text-[#24211F]'
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'reminders'
                  ? 'border-[#B85C38] text-[#B85C38] font-semibold'
                  : 'border-transparent text-[#716A63] hover:text-[#24211F]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Automation</span>
            </button>
          </div>

          {/* Feedback banner */}
          {sentReminderText && (
            <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sentReminderText}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'reminders' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9]">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-[#24211F]">
                      Automated WhatsApp Rent Reminders
                    </span>
                  </div>
                  <p className="text-xs text-[#716A63] leading-relaxed">
                    Nivaas sends automated gentle reminders on the 1st and 4th of every month. Overdue
                    defaulters receive a notification with an integrated UPI payment link.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#9E968E]">
                    Pending Defaulters Ready for Manual Nudge
                  </div>

                  <div className="p-3 bg-white border border-[#E8E1D9] rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#24211F]">Aakash Verma</p>
                      <p className="text-[11px] text-[#D64545] font-medium">
                        ₹16,000 overdue (Room 101-A)
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSendingWhatsApp}
                      onClick={() => handleSendWhatsAppReminder('Aakash Verma', '₹16,000')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-white border border-[#E8E1D9] rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#24211F]">Karan Malhotra</p>
                      <p className="text-[11px] text-[#D99118] font-medium">
                        ₹11,500 due in 2 days (Room 201-A)
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSendingWhatsApp}
                      onClick={() => handleSendWhatsAppReminder('Karan Malhotra', '₹11,500')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#716A63]">
                No alerts at this moment. Everything is operating smoothly.
              </div>
            ) : (
              filteredNotifs.map((n) => {
                const getIcon = () => {
                  switch (n.type) {
                    case 'rent_overdue':
                      return <AlertCircle className="w-4 h-4 text-[#D64545]" />;
                    case 'move_out':
                      return <Clock className="w-4 h-4 text-[#D99118]" />;
                    case 'kyc_pending':
                      return <UserCheck className="w-4 h-4 text-[#2786B8]" />;
                    case 'maintenance':
                      return <Wrench className="w-4 h-4 text-purple-600" />;
                    default:
                      return <Info className="w-4 h-4 text-[#16845B]" />;
                  }
                };

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      n.isRead
                        ? 'bg-white border-[#E8E1D9] opacity-75'
                        : 'bg-[#FFFEFC] border-[#B85C38]/30 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{getIcon()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#24211F]">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#B85C38] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[#716A63] mt-1 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
                          {n.linkRoute && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onNavigate(n.linkRoute as NavRoute);
                              }}
                              className="text-[11px] font-semibold text-[#B85C38] hover:underline"
                            >
                              View Details →
                            </button>
                          )}
                          {!n.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[11px] text-[#716A63] hover:text-[#24211F] ml-auto"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

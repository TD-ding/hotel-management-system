export const TYPE_LABELS = {
  standard: '标准',
  deluxe: '豪华',
  suite: '套房',
  presidential: '总统套房',
  family: '家庭',
  business: '商务',
};

export const STATUS_LABELS = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
};

export function typeLabel(type) {
  return TYPE_LABELS[type] || type;
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function statusBadgeStyle(status) {
  const base = { padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, display: 'inline-block' };
  if (status === 'confirmed') return { ...base, background: '#d4edda', color: '#155724' };
  if (status === 'cancelled') return { ...base, background: '#f8d7da', color: '#721c24' };
  return { ...base, background: '#fff3cd', color: '#856404' };
}

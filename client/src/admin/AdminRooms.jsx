import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const emptyRoom = { name: '', type: 'standard', price: '', capacity: '', description: '', amenities: '', available: 1 };

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/rooms').then(({ data }) => setRooms(data));
  useEffect(load, []);

  const reset = () => { setForm(emptyRoom); setEditing(null); setMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editing) {
        await api.put(`/rooms/${editing}`, form);
        setMsg('更新成功');
      } else {
        await api.post('/rooms', { ...form, price: Number(form.price), capacity: Number(form.capacity) });
        setMsg('创建成功');
      }
      reset(); load();
    } catch (err) { setMsg(err.response?.data?.error || '操作失败'); }
  };

  const handleEdit = (room) => {
    setEditing(room.id);
    setForm({ name: room.name, type: room.type, price: room.price, capacity: room.capacity, description: room.description, amenities: room.amenities, available: room.available });
    setMsg('');
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除此房间？')) return;
    await api.delete(`/rooms/${id}`); load();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>房间管理</h1>
        <Link to="/admin" style={styles.backBtn}>返回面板</Link>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.subTitle}>{editing ? '编辑房间' : '添加房间'}</h3>
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div><label style={styles.label}>房间名称</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={styles.input} /></div>
          <div><label style={styles.label}>房型</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={styles.input}>
              <option value="standard">标准</option><option value="deluxe">豪华</option><option value="suite">套房</option>
              <option value="presidential">总统套房</option><option value="family">家庭</option><option value="business">商务</option>
            </select>
          </div>
          <div><label style={styles.label}>价格/晚</label><input type="number" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={styles.input} /></div>
          <div><label style={styles.label}>容纳人数</label><input type="number" required value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} style={styles.input} /></div>
          <div style={{ gridColumn: '1/-1' }}><label style={styles.label}>描述</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...styles.input, height: 60 }} /></div>
          <div style={{ gridColumn: '1/-1' }}><label style={styles.label}>设施(逗号分隔)</label><input value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} style={styles.input} /></div>
          <div><label style={styles.label}>状态</label>
            <select value={form.available} onChange={e => setForm(f => ({ ...f, available: Number(e.target.value) }))} style={styles.input}>
              <option value={1}>可预订</option><option value={0}>不可订</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <button type="submit" style={styles.btn}>{editing ? '更新' : '创建'}</button>
            {editing && <button type="button" onClick={reset} style={styles.cancelBtn}>取消</button>}
          </div>
        </form>
        {msg && <p style={styles.msg}>{msg}</p>}
      </div>

      <table style={styles.table}>
        <thead><tr><th>ID</th><th>名称</th><th>类型</th><th>价格</th><th>容量</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.name}</td><td>{typeLabel(r.type)}</td>
              <td>¥{r.price}</td><td>{r.capacity}人</td>
              <td>{r.available ? '✅' : '❌'}</td>
              <td>
                <button onClick={() => handleEdit(r)} style={styles.editBtn}>编辑</button>
                <button onClick={() => handleDelete(r.id)} style={styles.delBtn}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function typeLabel(t) { return { standard: '标准', deluxe: '豪华', suite: '套房', presidential: '总统套房', family: '家庭', business: '商务' }[t] || t; }

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '30px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  backBtn: { color: '#e6b800', textDecoration: 'none', fontWeight: 500 },
  formCard: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 },
  subTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 600 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: { display: 'block', fontSize: 13, color: '#666', marginBottom: 4 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: '#e6b800', color: '#1a1a2e', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { padding: '8px 16px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' },
  msg: { color: '#27ae60', fontSize: 14, marginTop: 8 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  editBtn: { padding: '4px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  delBtn: { padding: '4px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 },
};

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { theme, layout } from '../theme';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', role: 'user' });

  const load = () => api.get('/users').then(({ data }) => setUsers(data));
  useEffect(load, []);

  const handleEdit = (user) => {
    setEditing(user.id);
    setForm({ username: user.username, email: user.email, role: user.role });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await api.put(`/users/${editing}`, form);
    setEditing(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除此用户？')) return;
    try { await api.delete(`/users/${id}`); load(); }
    catch (err) { alert(err.response?.data?.error || '删除失败'); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>用户管理</h1>
        <Link to="/admin" style={styles.backBtn}>返回面板</Link>
      </div>
      <table style={styles.table}>
        <thead><tr><th>ID</th><th>用户名</th><th>邮箱</th><th>角色</th><th>注册时间</th><th>操作</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              {editing === u.id ? (
                <>
                  <td>{u.id}</td>
                  <td><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={styles.input} /></td>
                  <td><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={styles.input} /></td>
                  <td>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={styles.input}>
                      <option value="user">用户</option><option value="admin">管理员</option>
                    </select>
                  </td>
                  <td>{u.created_at}</td>
                  <td>
                    <button onClick={handleSave} style={styles.saveBtn}>保存</button>
                    <button onClick={() => setEditing(null)} style={styles.cancelBtn}>取消</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td>
                  <td><span style={u.role === 'admin' ? styles.adminBadge : styles.userBadge}>{u.role === 'admin' ? '管理员' : '用户'}</span></td>
                  <td>{u.created_at}</td>
                  <td>
                    <button onClick={() => handleEdit(u)} style={styles.editBtn}>编辑</button>
                    <button onClick={() => handleDelete(u.id)} style={styles.delBtn}>删除</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  page: { maxWidth: layout.maxWidth, margin: '0 auto', padding: layout.pagePadding },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 700, color: theme.primary, margin: 0 },
  backBtn: { color: theme.accent, textDecoration: 'none', fontWeight: 500 },
  table: { width: '100%', borderCollapse: 'collapse', background: theme.white, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  input: { padding: '6px 8px', border: `1px solid ${theme.border}`, borderRadius: 3, fontSize: 13, width: '100%', boxSizing: 'border-box' },
  adminBadge: { background: theme.accent, color: theme.primary, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 },
  userBadge: { background: '#e8e8e8', color: theme.textLight, padding: '2px 8px', borderRadius: 4, fontSize: 12 },
  editBtn: { padding: '4px 10px', background: theme.info, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  delBtn: { padding: '4px 10px', background: theme.danger, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 },
  saveBtn: { padding: '4px 10px', background: theme.success, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: 12 },
  cancelBtn: { padding: '4px 10px', background: theme.white, color: theme.textLight, border: `1px solid ${theme.border}`, borderRadius: 3, cursor: 'pointer', fontSize: 12 },
};

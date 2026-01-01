import React, { useEffect, useState } from 'react';
import './Users.css';
import Navbar from '../Navbar/Navbar';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/Index';

function Users() {
  const { getAllUsers } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getAllUsers();
        setUsers(list);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(query.toLowerCase()) ||
    u.name?.toLowerCase().includes(query.toLowerCase()) ||
    (u.skills || []).join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="users-page">
        <header className="users-hero">
          <h1>Members</h1>
          <p>Browse other contributors and their skills.</p>
          <div className="users-actions">
            <input placeholder="Search by name, username or skill" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </header>

        <section className="users-list">
          {loading ? (
            <div className="empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No users found</div>
          ) : (
            filtered.map(u => (
              <article className="user-card" key={u.user_id}>
                <div className="user-meta">
                  <div className="name">{u.name || u.username}</div>
                  <div className="username">@{u.username}</div>
                </div>
                <div className="user-tags">{(u.skills || []).slice(0,4).map(s => <span key={s} className="tag">{s}</span>)}</div>
                <div className="card-actions">
                  <Link className="btn-outline small" to={`/users/${u.user_id}`}>View profile</Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}

export default Users;

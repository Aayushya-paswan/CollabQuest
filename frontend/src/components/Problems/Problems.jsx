import React, { useState } from 'react';
import './Problems.css';
import Navbar from '../Navbar/Navbar';
import { Link } from 'react-router-dom';

const sampleProblems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['arrays', 'hashmap'] },
  { id: 2, title: 'Binary Tree Inorder', difficulty: 'Medium', tags: ['trees', 'dfs'] },
  { id: 3, title: 'Graph Shortest Path', difficulty: 'Hard', tags: ['graphs', 'dijkstra'] }
];

function Problems() {
  const [query, setQuery] = useState('');

  const filtered = sampleProblems.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.join(' ').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="problems-page">
        <header className="problems-hero">
          <h1>Problems</h1>
          <p>Explore curated algorithmic and collaboration challenges.</p>
          <div className="problems-actions">
            <input
              className="search"
              placeholder="Search problems or tags..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Link to="/" className="btn-outline small">Back Home</Link>
          </div>
        </header>

        <section className="problems-list">
          {filtered.length === 0 ? (
            <div className="empty">No problems found for "{query}"</div>
          ) : (
            filtered.map(p => (
              <article className="problem-card" key={p.id}>
                <div className="meta">
                  <div className="title">{p.title}</div>
                  <div className="difficulty">{p.difficulty}</div>
                </div>
                <div className="tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                <div className="card-actions">
                  <Link className="btn-primary small" to={`/problems/${p.id}`}>Open</Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}

export default Problems;

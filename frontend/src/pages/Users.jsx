// import { useEffect, useState } from 'react';
// import api from '../api/api';
// import { useAuth } from '../auth/AuthContext';
// import React from 'react';
// const Users = () => {
//   const { user } = useAuth();

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const [search, setSearch] = useState('');
//   const [role, setRole] = useState('');

//   const loadUsers = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const res = await api.get(`/tenants/${user.tenant.id}/users`, {
//         params: {
//           search: search || undefined,
//           role: role || undefined
//         }
//       });

//       setUsers(res.data.data.users || res.data.data);
//     } catch (err) {
//       setError('Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user.role === 'tenant_admin') {
//       loadUsers();
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const deleteUser = async userId => {
//     if (userId === user.id) {
//       alert('You cannot delete yourself');
//       return;
//     }

//     const confirm = window.confirm(
//       'Are you sure you want to delete this user?'
//     );
//     if (!confirm) return;

//     try {
//       await api.delete(`/users/${userId}`);
//       loadUsers();
//     } catch (err) {
//       alert('Failed to delete user');
//     }
//   };

//   if (loading) return <div>Loading users...</div>;

//   if (user.role !== 'tenant_admin') {
//     return <div>You are not authorized to view this page.</div>;
//   }

//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Users</h2>

//       {/* Filters */}
//       <div style={{ marginBottom: 20 }}>
//         <input
//           type="text"
//           placeholder="Search by name or email"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />

//         <select
//           value={role}
//           onChange={e => setRole(e.target.value)}
//           style={{ marginLeft: 10 }}
//         >
//           <option value="">All Roles</option>
//           <option value="tenant_admin">Tenant Admin</option>
//           <option value="user">User</option>
//         </select>

//         <button onClick={loadUsers} style={{ marginLeft: 10 }}>
//           Apply
//         </button>
//       </div>

//       {/* Users Table */}
//       {users.length === 0 ? (
//         <p>No users found</p>
//       ) : (
//         <table border="1" cellPadding="8" cellSpacing="0">
//           <thead>
//             <tr>
//               <th>Full Name</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {users.map(u => (
//               <tr key={u.id}>
//                 <td>{u.fullName}</td>
//                 <td>{u.email}</td>
//                 <td>{u.role}</td>
//                 <td>{u.isActive ? 'Active' : 'Inactive'}</td>
//                 <td>
//                   <button
//                     onClick={() => deleteUser(u.id)}
//                     disabled={u.id === user.id}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Users;

import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.data.users);
      } catch (err) {
        console.error(err);
        setError('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <Navbar />
      <h2>Users</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.email} — {user.role}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Users;

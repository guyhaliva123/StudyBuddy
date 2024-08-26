import React, { useState, useEffect } from 'react';
import UserDetailsModal from './UserDetailsModal'; // Import the modal component

const AdminUserTable = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // State for the selected user
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/get_all_users', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                const usersData = await response.json();
                setUsers(usersData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleShowMore = (user) => {
        console.log("Show More button clicked for user:", user);
        setSelectedUser(user); // Set the selected user to trigger the modal
    };

    return (
        <div className="courses-table">
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <>
                    {users.length === 0 ? (
                        <h2>No Users Found</h2>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Date of Birth</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.dateOfBirth}</td>
                                        <td>{user.type}</td>
                                        <td>
                                            <button className="show-more-btn" onClick={() => handleShowMore(user)}>
                                                Show More
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default AdminUserTable;

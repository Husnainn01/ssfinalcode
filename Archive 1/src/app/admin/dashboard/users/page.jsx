"use client"

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@nextui-org/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "@/app/admin/components/block/modal";
import AddUser from '@/app/admin/components/block/addUser';
import EditUser from '@/app/admin/components/block/editUser';
import { motion, AnimatePresence } from "framer-motion";


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      console.log('Fetched users data:', data.users);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async () => {
    try {
      if (!deleteUserId) {
        toast.error('No user selected for deletion', {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const response = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: deleteUserId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== deleteUserId));
      
      setIsDeleteModalVisible(false);
      setDeleteUserId(null);

      toast.success('User deleted successfully!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <RoleBasedRoute route="/admin/dashboard/users" >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 relative"
    >
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Button 
          color="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="transition-transform duration-200 hover:scale-105"
          startContent={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          Add New User
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm"
      >
        <Table aria-label="Users table" className="min-w-full">
          <TableHeader>
            <TableColumn className="text-sm font-semibold">USERNAME</TableColumn>
            <TableColumn className="text-sm font-semibold">EMAIL</TableColumn>
            <TableColumn className="text-sm font-semibold">ROLE</TableColumn>
            <TableColumn className="text-sm font-semibold">STATUS</TableColumn>
            <TableColumn className="text-sm font-semibold">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow 
                key={user._id}
                className="transition-all duration-300 ease-in-out hover:bg-gray-50"
              >
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {user.username}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                  >
                    {user.email}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Chip
                      size="sm"
                      variant="flat"
                      color={user.role === 'admin' ? 'secondary' : 'primary'}
                    >
                      {user.role}
                    </Chip>
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <Chip
                      size="sm"
                      variant="flat"
                      color={user.isActive ? 'success' : 'danger'}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Chip>
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="flex gap-2"
                  >
                    <Button 
                      size="sm" 
                      color="primary"
                      variant="flat"
                      onClick={() => handleEditClick(user)}
                      className="transition-transform duration-200 hover:scale-105"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      }
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      color="danger"
                      variant="flat"
                      onClick={() => {
                        setDeleteUserId(user._id);
                        setIsDeleteModalVisible(true);
                      }}
                      className="transition-transform duration-200 hover:scale-105"
                      startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      }
                    >
                      Delete
                    </Button>
                  </motion.div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddUser 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
              fetchUsers();
              setIsAddModalOpen(false);
              toast.success('User created successfully!', {
                position: "bottom-right",
                autoClose: 2000,
              });
            }}
          />
        )}

        {isEditModalOpen && (
          <EditUser 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={selectedUser}
            onSuccess={() => {
              fetchUsers();
              setIsEditModalOpen(false);
              toast.success('User updated successfully!', {
                position: "bottom-right",
                autoClose: 2000,
              });
            }}
          />
        )}

        {isDeleteModalVisible && (
          <CustomModal
            isOpen={isDeleteModalVisible}
            onClose={() => {
              setIsDeleteModalVisible(false);
              setDeleteUserId(null);
            }}
            onConfirm={handleDeleteClick}
            title="Confirm Deletion"
          >
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          </CustomModal>
        )}
      </AnimatePresence>
    </motion.div>
    </RoleBasedRoute>
  );
}
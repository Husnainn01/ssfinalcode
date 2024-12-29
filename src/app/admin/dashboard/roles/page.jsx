"use client";
import { useState, useEffect } from "react";
import { roleService } from "@/services/roleService";
import { withRoleCheck } from '@/components/hoc/withRoleCheck';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
  Spinner,
  Chip
} from "@nextui-org/react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import RoleFormModal from "./components/RoleFormModal";
import CustomModal from "@/components/block/modal";
import { toast } from "react-toastify";

function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const columns = [
    { name: "NAME", uid: "name" },
    { name: "ROLE", uid: "role" },
    { name: "EMAIL", uid: "email" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const fetchedRoles = await roleService.getAllRoles();
      console.log('Fetched roles:', fetchedRoles); // Debug log
      setRoles(fetchedRoles);
    } catch (error) {
      console.error('Fetch roles error:', error);
      toast.error(error.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (role, columnKey) => {
    switch (columnKey) {
      case "name":
        return <div className="font-medium">{role.name}</div>;
      case "role":
        return <div>{role.role}</div>;
      case "email":
        return <div>{role.email}</div>;
      case "status":
        return (
          <Chip
            className="capitalize"
            color={role.status === "active" ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {role.status}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => handleEditRole(role)}
            >
              <FaEdit className="text-default-500" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => handleDeleteClick(role)}
            >
              <FaTrash className="text-danger" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    onOpen();
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitRole = async (formData) => {
    try {
      setLoading(true);
      if (selectedRole) {
        await roleService.updateRole(selectedRole._id, formData);
        toast.success("Role updated successfully");
      } else {
        await roleService.createRole(formData);
        toast.success("Role created successfully");
      }
      await fetchRoles(); // Refresh the roles list
      onClose();
    } catch (error) {
      console.error('Submit role error:', error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await roleService.deleteRole(roleToDelete._id);
      toast.success("Role deleted successfully");
      setIsDeleteModalOpen(false);
      await fetchRoles(); // Refresh the roles list
    } catch (error) {
      console.error('Delete role error:', error);
      toast.error(error.message || "Failed to delete role");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onClick={() => {
            setSelectedRole(null);
            onOpen();
          }}
        >
          Add New Role
        </Button>
      </div>

      <Table aria-label="Roles table">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          ))}
        </TableHeader>
        <TableBody 
          items={roles}
          emptyContent="No roles found"
        >
          {(role) => (
            <TableRow key={role._id}>
              {(columnKey) => (
                <TableCell>{renderCell(role, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <RoleFormModal
        isOpen={isOpen}
        onClose={onClose}
        role={selectedRole}
        onSubmit={handleSubmitRole}
      />

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
      >
        <p>Are you sure you want to delete this role? This action cannot be undone.</p>
      </CustomModal>
    </div>
  );
}

// Wrap the component with withRoleCheck HOC
// Only users with 'admin' role can access this page
export default withRoleCheck(RolesManagement, ['admin']); 
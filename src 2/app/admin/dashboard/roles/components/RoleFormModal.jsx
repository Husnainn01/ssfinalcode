"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Divider,
} from "@nextui-org/react";
import { useToast } from "@/hooks/use-toast";
import bcrypt from "bcryptjs";

export default function RoleFormModal({ isOpen, onClose, role, onSubmit }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "Role",
    email: "",
    password: "",
    role: "",
    status: "active",
    permissions: [],
  });

  // Available permissions - in real app, this might come from an API
  const availablePermissions = {
    Users: [
      "view_users",
      "create_users",
      "edit_users",
      "delete_users",
    ],
    Posts: [
      "view_posts",
      "create_posts",
      "edit_posts",
      "delete_posts",
    ],
    Settings: [
      "view_settings",
      "edit_settings",
    ],
    Roles: [
      "view_roles",
      "create_roles",
      "edit_roles",
      "delete_roles",
    ],
  };

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        lastName: role.lastName || "Role",
        email: role.email || "",
        password: role.password || "",
        role: role.role || "",
        status: role.status || "active",
        permissions: role.permissions || [],
      });
    } else {
      // Reset form when creating new role
      setFormData({
        name: "",
        lastName: "Role",
        email: "",
        password: "",
        role: "",
        status: "active",
        permissions: [],
      });
    }
  }, [role]);

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSelectAllInGroup = (group, isSelected) => {
    setFormData((prev) => ({
      ...prev,
      permissions: isSelected
        ? [...new Set([...prev.permissions, ...availablePermissions[group]])]
        : prev.permissions.filter((p) => !availablePermissions[group].includes(p)),
    }));
  };

  const isGroupFullySelected = (group) => {
    return availablePermissions[group].every((permission) =>
      formData.permissions.includes(permission)
    );
  };

  const isGroupPartiallySelected = (group) => {
    return availablePermissions[group].some((permission) =>
      formData.permissions.includes(permission)
    ) && !isGroupFullySelected(group);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format the data to match your schema
      const submitData = {
        name: formData.name,
        lastName: "Role",
        email: formData.email,
        password: await bcrypt.hash(formData.password || "defaultPassword123", 10),
        role: formData.name.toLowerCase(),
        status: formData.status,
        permissions: formData.permissions,
      };

      onSubmit(submitData);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process role data",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-bold">
            {role ? "Edit Role" : "Create New Role"}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <Input
              label="Role Name"
              placeholder="Enter role name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              isRequired
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              isRequired
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              isRequired
            />

            <div>
              <h4 className="text-lg font-semibold mb-4">Permissions</h4>
              <div className="space-y-6">
                {Object.entries(availablePermissions).map(([group, permissions]) => (
                  <div key={group} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        isSelected={isGroupFullySelected(group)}
                        isIndeterminate={isGroupPartiallySelected(group)}
                        onValueChange={(isSelected) =>
                          handleSelectAllInGroup(group, isSelected)
                        }
                      >
                        <span className="font-semibold">{group}</span>
                      </Checkbox>
                    </div>
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <Checkbox
                          key={permission}
                          isSelected={formData.permissions.includes(permission)}
                          onValueChange={() => handlePermissionChange(permission)}
                        >
                          {permission.split("_").join(" ")}
                        </Checkbox>
                      ))}
                    </div>
                    <Divider className="my-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {role ? "Update Role" : "Create Role"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 
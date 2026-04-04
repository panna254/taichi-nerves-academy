import { useEffect, useState } from "react";
import { adminService, showToast } from "@/services/adminService";
import { AdminUser, User } from "@/services/adminService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UsersRolesPage = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [regularUsers, setRegularUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load admin users
      const adminResult = await adminService.getAdminUsers();
      if (adminResult.success && adminResult.data) {
        setAdminUsers(adminResult.data);
      } else {
        setError(adminResult.error || "Failed to load admin users");
        showToast(false, adminResult.error || "Failed to load admin users");
      }

      // Load regular users
      const userResult = await adminService.getUsers();
      if (userResult.success && userResult.data) {
        setRegularUsers(userResult.data);
      } else {
        setError(userResult.error || "Failed to load users");
        showToast(false, userResult.error || "Failed to load users");
      }
    } catch (err) {
      setError("Failed to load users");
      showToast(false, "Failed to load users");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: 'admin' | 'editor' | 'reviewer') => {
    setBusyId(userId);
    
    const result = await adminService.addAdminUser(userId, role);
    
    if (result.success) {
      showToast(true, "User role updated successfully");
      loadUsers();
    } else {
      showToast(false, result.error || "Failed to update user role");
    }
    
    setBusyId(null);
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to remove admin access for this user?")) {
      return;
    }

    setBusyId(userId);
    
    const result = await adminService.removeAdminUser(userId);
    
    if (result.success) {
      showToast(true, "Admin access removed successfully");
      loadUsers();
    } else {
      showToast(false, result.error || "Failed to remove admin access");
    }
    
    setBusyId(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-card-foreground">Users & Roles</h2>
        <p className="text-sm text-muted-foreground">Manage access levels for admins, editors, and reviewers.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Users</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Admin Users */}
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-3">Admin Users</h3>
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">User</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="border-t border-border/60">
                      <td className="px-4 py-3" colSpan={4}>
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : adminUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                      No admin users found.
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((adminUser) => (
                    <tr key={adminUser.id} className="border-t border-border/60">
                      <td className="px-4 py-3 font-semibold text-card-foreground">
                        {adminUser.user?.full_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{adminUser.user?.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`capitalize ${getRoleColor(adminUser.role)}`}>
                          {adminUser.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAdmin(adminUser.user_id)}
                          disabled={busyId === adminUser.user_id}
                        >
                          Remove Admin
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regular Users */}
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-3">Regular Users</h3>
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">User</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Membership</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="border-t border-border/60">
                      <td className="px-4 py-3" colSpan={4}>
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : regularUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  regularUsers.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-t border-border/60">
                      <td className="px-4 py-3 font-semibold text-card-foreground">{user.full_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getRoleColor(user.membership_status)}>
                          {user.membership_status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Select 
                          value="" 
                          onValueChange={(val) => handleRoleChange(user.id, val as 'admin' | 'editor' | 'reviewer')}
                          disabled={busyId === user.id}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersRolesPage;






import { useEffect, useState } from "react";
import { adminApi } from "@/services/mockAdminApi";
import { Role, User } from "@/types/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const UsersRolesPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id: string, role: Role) => {
    await adminApi.updateUserRole(id, role);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-card-foreground">Users & Roles</h2>
        <p className="text-sm text-muted-foreground">Manage access levels for admins, editors, and reviewers.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx} className="border-t border-border/60">
                  <td className="px-4 py-3" colSpan={3}>
                    <Skeleton className="h-10 w-full" />
                  </td>
                </tr>
              ))
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-semibold text-card-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Select value={user.role} onValueChange={(val) => handleRoleChange(user.id, val as Role)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="REVIEWER">Reviewer</SelectItem>
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
  );
};

export default UsersRolesPage;






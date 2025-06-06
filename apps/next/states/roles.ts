import { BehaviorSubject } from "rxjs";
import { Role } from "@/services/identity-service";

class RoleStore {
  private rolesSubject = new BehaviorSubject<Role[]>([]);

  addOrUpdate(role: Role): void {
    const current = this.rolesSubject.getValue();
    const index = current.findIndex((r) => r.id === role.id);

    if (index >= 0) {
      current[index] = role;
    } else {
      current.push(role);
    }

    this.rolesSubject.next([...current]);
  }

  remove(role: Role): void {
    const current = this.rolesSubject.getValue();
    const updated = current.filter((r) => r.id !== role.id);
    this.rolesSubject.next(updated);
  }

  async load(loader: () => Promise<Role[]>): Promise<void> {
    const result = await loader();
    this.rolesSubject.next(result);
  }

  subscribe(callback: (roles: Role[]) => void): () => void {
    const subscription = this.rolesSubject.subscribe(callback);
    return subscription.unsubscribe.bind(subscription);
  }

  get(): Role[] {
    return this.rolesSubject.getValue();
  }
}

export const roleStore = new RoleStore();

import { BehaviorSubject } from "rxjs";
import { Category } from "@/services/category-service";

class CategoryStore {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  addOrUpdate(category: Category): void {
    const current = this.categoriesSubject.getValue();
    const index = current.findIndex((c) => c.id === category.id);

    if (index >= 0) {
      current[index] = category;
    } else {
      current.push(category);
    }

    this.categoriesSubject.next([...current]);
  }

  remove(category: Category): void {
    const current = this.categoriesSubject.getValue();
    const updated = current.filter((c) => c.id !== category.id);
    this.categoriesSubject.next(updated);
  }

  async load(loader: () => Promise<Category[]>): Promise<void> {
    const result = await loader();
    this.categoriesSubject.next(result);
  }

  subscribe(callback: (categories: Category[]) => void): () => void {
    const subscription = this.categoriesSubject.subscribe(callback);
    return subscription.unsubscribe.bind(subscription);
  }

  get(): Category[] {
    return this.categoriesSubject.getValue();
  }
}

export const categoryStore = new CategoryStore();

/**
 * Local Storage Management Utility
 * Provides a simple database-like interface using localStorage
 * Syncs across browser tabs in real-time
 */

export interface StorageOptions {
  version?: number;
  expiry?: number; // milliseconds
}

class LocalStorageDB {
  private prefix = "xplore_";

  // Initialize storage with default data
  init() {
    if (!localStorage.getItem(`${this.prefix}initialized`)) {
      this.setItem("users", [
        {
          id: "u-001",
          firstName: "Jose",
          lastName: "Dela Cruz",
          email: "jose.dc@xplore.io",
          password: "hashed_password_123",
          role: "ADMIN",
          status: "ACTIVE",
          department: "Information Technology",
          avatarInitials: "JDC",
          bio: "Platform administrator for Xplore Nexus.",
          phone: "+63 912 345 6789",
          lastActive: new Date().toISOString(),
          createdAt: "2025-01-10T00:00:00.000Z",
        },
        {
          id: "u-002",
          firstName: "Maria",
          lastName: "Santos",
          email: "maria.santos@xplore.io",
          password: "hashed_password_123",
          role: "ORGANIZER",
          status: "ACTIVE",
          department: "Events & Communications",
          avatarInitials: "MS",
          lastActive: new Date().toISOString(),
          createdAt: "2025-02-14T00:00:00.000Z",
        },
        {
          id: "u-004",
          firstName: "Anna",
          lastName: "Cruz",
          email: "anna.cruz@xplore.io",
          password: "hashed_password_123",
          role: "INSTRUCTOR",
          status: "ACTIVE",
          department: "Learning & Development",
          avatarInitials: "AC",
          lastActive: new Date().toISOString(),
          createdAt: "2025-03-15T00:00:00.000Z",
        },
        {
          id: "u-007",
          firstName: "Carlos",
          lastName: "Bautista",
          email: "carlos.bautista@xplore.io",
          password: "hashed_password_123",
          role: "PARTICIPANT",
          status: "ACTIVE",
          department: "Finance",
          avatarInitials: "CB",
          lastActive: new Date().toISOString(),
          createdAt: "2025-05-05T00:00:00.000Z",
        },
      ]);

      this.setItem("events", []);
      this.setItem("registrations", []);
      this.setItem("trainings", []);
      this.setItem("enrollments", []);
      this.setItem("payments", []);
      this.setItem("certificates", []);
      this.setItem("notifications", []);
      this.setItem("meetings", []);
      this.setItem("feedback", []);

      localStorage.setItem(`${this.prefix}initialized`, "true");
      console.log("✓ localStorage initialized with demo data");
    }
  }

  // Get item from localStorage
  getItem<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(`${this.prefix}${key}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return [];
    }
  }

  // Set item in localStorage
  setItem(key: string, value: any) {
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `${this.prefix}${key}`,
          newValue: JSON.stringify(value),
        })
      );
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }

  // Find single item
  findOne<T>(collection: string, predicate: (item: any) => boolean): T | null {
    const items = this.getItem<T>(collection);
    return items.find(predicate) || null;
  }

  // Find multiple items
  findMany<T>(collection: string, predicate?: (item: any) => boolean): T[] {
    const items = this.getItem<T>(collection);
    return predicate ? items.filter(predicate) : items;
  }

  // Create item
  create<T>(collection: string, item: T): T {
    const items = this.getItem<T>(collection);
    items.push(item);
    this.setItem(collection, items);
    return item;
  }

  // Update item
  update<T>(
    collection: string,
    id: string,
    updates: Partial<T>
  ): T | null {
    const items = this.getItem<T>(collection);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    this.setItem(collection, items);
    return items[index];
  }

  // Delete item
  delete(collection: string, id: string): boolean {
    const items = this.getItem<any>(collection);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    this.setItem(collection, items);
    return true;
  }

  // Clear all data
  clear() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(this.prefix));
    keys.forEach((k) => localStorage.removeItem(k));
    console.log("✓ localStorage cleared");
  }
}

export const db = new LocalStorageDB();

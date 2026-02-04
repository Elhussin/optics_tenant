import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";

/**
 * Loads translation files dynamically from the file system.
 * Supports both root-level files and subdirectories (e.g., forms/).
 *
 * @param locale The locale to load messages for (e.g., 'en', 'ar')
 * @param namespaces Optional array of specific namespaces to load (e.g., ['common', 'inventory'])
 */
export async function getTrenMessagesFiles(
  locale: string,
  namespaces?: string[],
) {
  try {
    const messagesDir = path.join(process.cwd(), "src/messages", locale);

    // Check if directory exists
    try {
      await fs.access(messagesDir);
    } catch {
      return {};
    }

    const messages: Record<string, any> = {};

    // List of files that should be flattened (merged into root)
    const filesToFlatten = [
      "common",
      "formGenerator",
      "products",
      "orders",
      "auth",
      "forms/_shared", // Shared form components
    ];

    // Helper for deep merging objects
    const deepMerge = (target: any, source: any) => {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          Object.assign(source[key], deepMerge(target[key], source[key]));
        }
      }
      Object.assign(target || {}, source);
      return target;
    };

    // Helper to load a single JSON file
    const loadJsonFile = async (filePath: string, namespace: string) => {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const parsedContent = JSON.parse(fileContent);

      if (filesToFlatten.includes(namespace)) {
        // Deep merge keys into the root messages object to prevent overwriting
        deepMerge(messages, parsedContent);
      } else {
        // Namespace the content locally
        messages[namespace] = parsedContent;
      }
    };

    // Load root-level files
    const files = await fs.readdir(messagesDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const namespace = file.replace(".json", "");

        // If namespaces filter is provided, skip if not included
        if (namespaces && !namespaces.includes(namespace)) {
          continue;
        }

        const filePath = path.join(messagesDir, file);
        await loadJsonFile(filePath, namespace);
      }
    }

    // Load forms/ subdirectory if it exists
    const formsDir = path.join(messagesDir, "forms");
    try {
      await fs.access(formsDir);
      const formFiles = await fs.readdir(formsDir);

      for (const file of formFiles) {
        if (file.endsWith(".json")) {
          const namespace = `forms/${file.replace(".json", "")}`;

          // If namespaces filter is provided, skip if not included
          if (namespaces && !namespaces.includes(namespace)) {
            continue;
          }

          const filePath = path.join(formsDir, file);
          await loadJsonFile(filePath, namespace);
        }
      }
    } catch {
      // forms/ directory doesn't exist yet, that's okay
    }

    return messages;
  } catch (error) {
    console.error("Error loading messages:", error);
    notFound();
  }
}
import re
import sys


def sort_entity_config(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    start_marker = "export const formsConfig: Record<string, FormConfig> = {"
    end_marker = "};"

    start_pos = content.find(start_marker)
    if start_pos == -1:
        print("Could not find start marker")
        return

    # Find the last closing brace
    end_pos = content.rfind("};")
    if end_pos == -1:
        print("Could not find end marker")
        return

    pre_content = content[:start_pos + len(start_marker)]
    config_body = content[start_pos + len(start_marker):end_pos]
    post_content = content[end_pos:]

    # Parse entries
    # We'll split by newlines but accumulate lines into blocks based on brace counting
    lines = config_body.split('\n')
    entries = []
    current_entry_lines = []
    brace_count = 0
    in_entry = False
    current_key = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Ignore standalone comments that are section headers or separators
        if stripped.startswith("//") and not in_entry:
            continue

        # Detect start of an entry: key: {
        # Regex for keys: bare words or quoted strings
        # key: {
        # "key": {
        start_match = re.match(r'^\s*(?:[\w-]+|"[^"]+")\s*:\s*\{', line)

        if start_match and not in_entry:
            in_entry = True
            brace_count = line.count('{') - line.count('}')
            current_entry_lines = [line]
            # enhance key extraction for sorting consistency
            key_match = re.match(r'^\s*(?:("?)([\w-]+)\1)\s*:', line)
            current_key = key_match.group(2) if key_match else "unknown"

            if brace_count == 0:
                # One-line entry
                entries.append(create_entry(current_key, current_entry_lines))
                in_entry = False
                current_entry_lines = []

        elif in_entry:
            current_entry_lines.append(line)
            brace_count += line.count('{') - line.count('}')
            if brace_count <= 0:
                # End of entry
                entries.append(create_entry(current_key, current_entry_lines))
                in_entry = False
                current_entry_lines = []

    # Sort and Group
    groups = {
        "TENANT APP": [],
        "USERS APP": [],
        "CRM APP": [],
        "HRM APP": [],
        "PRODUCTS / INVENTORY APP": [],
        "SALES APP": [],
        "ACCOUNTING APP": [],
        "BRANCHES APP": [],
        "MOBILE APP": [],
        "CORE / OTHER": []
    }

    for entry in entries:
        group_name = determine_group(entry['content'], entry['key'])
        entry['group'] = group_name
        groups[group_name].append(entry)

    # Reconstruct File
    new_body = "\n"
    for group_name, group_entries in groups.items():
        if not group_entries:
            continue

        # Sort alphabetically by key within group
        group_entries.sort(key=lambda x: x['key'])

        new_body += f"\n  // {group_name}\n"
        for entry in group_entries:
            new_body += "".join([l + "\n" for l in entry['content']])

    final_content = pre_content + new_body + post_content

    with open(file_path, 'w') as f:
        f.write(final_content)
    print(f"Sorted {len(entries)} entries successfully.")


def create_entry(key, lines):
    return {
        'key': key,
        'content': lines
    }


def determine_group(lines, key):
    text = "".join(lines)
    # Priority check for aliases
    # pattern: listAlias: "prefix_..."
    # pattern: createAlias: "prefix_..."

    # We look for the first occurrence of an alias string value
    # Regex designed to catch: alias: "value"
    # match listAlias or createAlias or retrieveAlias

    aliases = re.findall(r'[a-z]+Alias["\']?:\s*["\']([a-zA-Z0-9_]+)', text)

    if aliases:
        # Use first alias wrapper prefix
        first_alias = aliases[0]
        prefix = first_alias.split('_')[0].lower()

        prefix_map = {
            'tenants': "TENANT APP",
            'users': "USERS APP",
            'crm': "CRM APP",
            'hrm': "HRM APP",
            'products': "PRODUCTS / INVENTORY APP",
            'sales': "SALES APP",
            'accounting': "ACCOUNTING APP",
            'branches': "BRANCHES APP",
            'mobile': "MOBILE APP",
            'core': "CORE / OTHER"
        }

        if prefix in prefix_map:
            return prefix_map[prefix]

    # Fallback to key analysis if alias is elusive or non-standard
    if key.startswith("crm-"):
        return "CRM APP"
    if key.startswith("hrm-"):
        return "HRM APP"
    if key.startswith("sales-"):
        return "SALES APP"
    if key.startswith("products-"):
        return "PRODUCTS / INVENTORY APP"
    if key.startswith("accounting-"):
        return "ACCOUNTING APP"

    # Defaults
    if key in ['clients', 'domain', 'subscription-plans', 'register-tenants', 'tenants-activate']:
        return "TENANT APP"
    if key in ['users', 'roles', 'permissions', 'contact-us', 'role-permissions', 'tenant-settings', 'register-users', 'user-profile', 'logout', 'password-reset', 'password-reset-confirm', 'login', 'app-health', 'public-pages', 'pages']:
        return "USERS APP"
    if key in ['branches', 'branch-users', 'branches-shift']:
        return "BRANCHES APP"

    return "CORE / OTHER"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python sort_entity_config.py <file_path>")
    else:
        sort_entity_config(sys.argv[1])

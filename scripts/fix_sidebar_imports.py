from pathlib import Path

root = Path(
    r"c:\Users\ramh7\OneDrive - Sri Lanka Institute of Information Technology\Desktop\BipFit project\frontend\src"
)
needle = "'" + "\\" + "nimport"
replacement = "'\nimport"

for path in root.rglob("*.jsx"):
    text = path.read_text(encoding="utf-8")
    if needle in text:
        path.write_text(text.replace(needle, replacement), encoding="utf-8")
        print("fixed", path.name)

# Also ensure sidebars use displayName after useAuth injection
for name in [
    "ManagerSidebar.jsx",
    "CoachSidebar.jsx",
    "NutritionSidebar.jsx",
    "MedicalSidebar.jsx",
    "SupportSidebar.jsx",
]:
    path = root / "components" / "layout" / name
    text = path.read_text(encoding="utf-8")
    if "const { user } = useAuth()" not in text and "useAuth" in text:
        text = text.replace(
            "export default function "
            + name.replace("Sidebar.jsx", "Sidebar")
            + "({ mobileOpen, onClose }) {\n  return (",
            "export default function "
            + name.replace("Sidebar.jsx", "Sidebar")
            + "({ mobileOpen, onClose }) {\n  const { user } = useAuth()\n  const displayName = user?.fullName || 'Team member'\n  return (",
        )
        path.write_text(text, encoding="utf-8")
        print("hooks", name)

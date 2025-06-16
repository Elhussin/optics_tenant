import os

# إعدادات النموذج
app_name = "products"  # اسم التطبيق
model_name = "Product"  # اسم الموديل
model_name_lower = model_name.lower()

# مجلد القوالب
base_template_dir = os.path.join("templates", app_name)
os.makedirs(base_template_dir, exist_ok=True)

# القوالب التي سيتم إنشاؤها
templates = {
    "list": f"""
{{% extends 'base.html' %}}

{{% block content %}}
    <h1>{model_name} List</h1>
    <ul>
        {{% for obj in object_list %}}
            <li><a href="{{{{ obj.get_absolute_url }}}}">{{{{ obj }}}}</a></li>
        {{% endfor %}}
    </ul>
    <a href="{{% url '{app_name}:{model_name_lower}_create' %}}">Create new</a>
{{% endblock %}}
""",

    "detail": f"""
{{% extends 'base.html' %}}

{{% block content %}}
    <h1>{model_name} Detail</h1>
    <p>{{{{ object }}}}</p>
    <a href="{{% url '{app_name}:{model_name_lower}_update' object.pk %}}">Edit</a> |
    <a href="{{% url '{app_name}:{model_name_lower}_delete' object.pk %}}">Delete</a> |
    <a href="{{% url '{app_name}:{model_name_lower}_list' %}}">Back</a>
{{% endblock %}}
""",

    "form": f"""
{{% extends 'base.html' %}}

{{% block content %}}
    <h1>{{{{ view.action }}}} {model_name}</h1>
    <form method="post">
        {{% csrf_token %}}
        {{{{ form.as_p }}}}
        <button type="submit">Save</button>
    </form>
    <a href="{{% url '{app_name}:{model_name_lower}_list' %}}">Back to list</a>
{{% endblock %}}
""",

    "confirm_delete": f"""
{{% extends 'base.html' %}}

{{% block content %}}
    <h1>Delete {model_name}</h1>
    <p>Are you sure you want to delete "{{{{ object }}}}"?</p>
    <form method="post">
        {{% csrf_token %}}
        <button type="submit">Yes, delete</button>
    </form>
    <a href="{{% url '{app_name}:{model_name_lower}_detail' object.pk %}}">Cancel</a>
{{% endblock %}}
""",
}

# كتابة الملفات
for name, content in templates.items():
    filename = f"{model_name_lower}_{name}.html"
    filepath = os.path.join(base_template_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"✅ Created: {filepath}")

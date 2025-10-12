{showModal && (
    <DynamicFormDialog
      entity={entity}
      onClose={(data: any) => {
        setShowModal(false);
        if (data) {
          // fetchAttributes.refetch();
          setAttributes((prev) => [data, ...prev]);
          // هنا نستخدم الاسم الصحيح للحقل الذي تم اختياره
          setValue(currentFieldName, String(data.id));
        }


      }}
      title="Add Attribute Value"
    />
  )}

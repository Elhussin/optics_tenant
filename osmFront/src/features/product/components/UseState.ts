import { useState } from "react";

const [state, setState] = useState({
    showModal: false,
    entity: "",
    attributes: [],
    currentFieldName: "",
    variantCount: 1,
    isProduct: true,
    isVariant: false,
    openVariantIndex: null,
  });
  
  // مثال على تحديث قيمة واحدة
  const toggleVariant = () => {
    setState(prev => ({ ...prev, isVariant: !prev.isVariant }));
  };
  
  // تحديث variant index
  const openVariant = (index: number) => {
    setState(prev => ({
      ...prev,
      openVariantIndex: prev.openVariantIndex === index ? null : index
    }));
  };
  
  // تحديث variantCount
  const setVariantCount = (count: number) => {
    setState(prev => ({ ...prev, variantCount: count }));
  };
  
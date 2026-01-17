export function selectRelatedData(data: any, filter?: string) {
  let relatedData = [];

  switch (filter) {
    case "categories":
      relatedData = data.categories || [];
      break;
    case "suppliers":
      relatedData = data.suppliers || [];
      break;
    case "manufacturers":
      relatedData = data.manufacturers || [];
      break;
    case "brands":
      relatedData = data.brands || [];
      break;
    case "attributes":
      relatedData = data.attributes || [];
      break;
    case "attribute-values":
      relatedData = data["attribute-values"] || [];
      break;
    default:
      // For attribute-values with specific filter (like "Base Curve", "Color", etc.)
      // We return all attribute-values and let parsedOptions filter by attribute_name
      relatedData = data["attribute-values"] || [];
      break;
  }
  return relatedData;
}

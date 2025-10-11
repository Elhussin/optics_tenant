
export function selectRelatedData(data: any, filter?: string) {
    switch (filter) {
      case "Category":
        return data.categories || [];
      case "Supplier":
        return data.suppliers || [];
      case "Manufacturer":
        return data.manufacturers || [];
      case "Brand":
        return data.brands || [];
      default:
        return data.attributes || [];
    }
  }
  
import React, { useEffect } from 'react';
import { schemas } from '@/src/shared/api/schemas';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { safeToast } from "@/src/shared/utils/toastService";
import { useFilteredListRequest } from '@/src/shared/hooks/useFilteredListRequest';
const schema = schemas.ProductVariantRequest;

export default function ProductVariantForm({ alias, title, message, submitText, id, isView = false, className = "",}: any) {
  
  const updateProductVariant= useApiForm({ alias: "products_product-variants_update" });
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset ,   } = useApiForm({ alias: alias});
  const [customers, setCustomers] = React.useState<any[]>([]);
  const fetchCustomers = useFilteredListRequest("users_customers_list");
  // Fetch customers
  useEffect(() => {
    fetchCustomers.query.refetch().then((res: any) => {
      if (res?.data?.results) {
        setCustomers(res.data.results.reverse());
        if (!id && res.data.results.length > 0) {
          setValue("customer", String(res.data.results[0].id));
        }
      }
    });
  }, [fetchCustomers]);

  const onSubmit = async (data: any) => {
      try {
      let result;
      if (id) {
        result = await updateProductVariant.mutation.mutateAsync(data);

      } else {
        result = await submitForm(data);

      }

      if (result?.success) {
        reset();
    
        safeToast(message || "Saved successfully", { type: "success" });
        reset(result.data);
      }
    } catch (err: any) {
      safeToast(err.message || "Server error", { type: "error" });
    }
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
  <div className="mb-4">
    
    <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
      Product id *
    </label>
    <input 
      id="product_id" 
      type="number" 
      {...register("product_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Product id..."
      
    />
    
    {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
      Sku *
    </label>
    <input 
      id="sku" 
      type="text" 
      {...register("sku")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Sku..."
      
    />
    
    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="frame_shape_id" className="block text-sm font-medium text-gray-700 mb-1">
      Frame shape id
    </label>
    <input 
      id="frame_shape_id" 
      type="number" 
      {...register("frame_shape_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Frame shape id..."
      
    />
    
    {errors.frame_shape_id && <p className="text-red-500 text-sm mt-1">{errors.frame_shape_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="frame_material_id" className="block text-sm font-medium text-gray-700 mb-1">
      Frame material id
    </label>
    <input 
      id="frame_material_id" 
      type="number" 
      {...register("frame_material_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Frame material id..."
      
    />
    
    {errors.frame_material_id && <p className="text-red-500 text-sm mt-1">{errors.frame_material_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="frame_color_id" className="block text-sm font-medium text-gray-700 mb-1">
      Frame color id
    </label>
    <input 
      id="frame_color_id" 
      type="color" 
      {...register("frame_color_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Frame color id..."
      
    />
    
    {errors.frame_color_id && <p className="text-red-500 text-sm mt-1">{errors.frame_color_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="temple_length_id" className="block text-sm font-medium text-gray-700 mb-1">
      Temple length id
    </label>
    <input 
      id="temple_length_id" 
      type="number" 
      {...register("temple_length_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Temple length id..."
      
    />
    
    {errors.temple_length_id && <p className="text-red-500 text-sm mt-1">{errors.temple_length_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="bridge_width_id" className="block text-sm font-medium text-gray-700 mb-1">
      Bridge width id
    </label>
    <input 
      id="bridge_width_id" 
      type="number" 
      {...register("bridge_width_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Bridge width id..."
      
    />
    
    {errors.bridge_width_id && <p className="text-red-500 text-sm mt-1">{errors.bridge_width_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_diameter_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens diameter id
    </label>
    <input 
      id="lens_diameter_id" 
      type="number" 
      {...register("lens_diameter_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Lens diameter id..."
      
    />
    
    {errors.lens_diameter_id && <p className="text-red-500 text-sm mt-1">{errors.lens_diameter_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_color_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens color id
    </label>
    <input 
      id="lens_color_id" 
      type="color" 
      {...register("lens_color_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Lens color id..."
      
    />
    
    {errors.lens_color_id && <p className="text-red-500 text-sm mt-1">{errors.lens_color_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_material_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens material id
    </label>
    <input 
      id="lens_material_id" 
      type="number" 
      {...register("lens_material_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Lens material id..."
      
    />
    
    {errors.lens_material_id && <p className="text-red-500 text-sm mt-1">{errors.lens_material_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_base_curve_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens base curve id
    </label>
    <input 
      id="lens_base_curve_id" 
      type="number" 
      {...register("lens_base_curve_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Lens base curve id..."
      
    />
    
    {errors.lens_base_curve_id && <p className="text-red-500 text-sm mt-1">{errors.lens_base_curve_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_water_content_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens water content id
    </label>
    <textarea 
      id="lens_water_content_id" 
      {...register("lens_water_content_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      rows={3}
      placeholder="Lens water content id..."
    />
    
    {errors.lens_water_content_id && <p className="text-red-500 text-sm mt-1">{errors.lens_water_content_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="replacement_schedule_id" className="block text-sm font-medium text-gray-700 mb-1">
      Replacement schedule id
    </label>
    <input 
      id="replacement_schedule_id" 
      type="number" 
      {...register("replacement_schedule_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Replacement schedule id..."
      
    />
    
    {errors.replacement_schedule_id && <p className="text-red-500 text-sm mt-1">{errors.replacement_schedule_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_coatings_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens coatings id
    </label>
    <div className="space-y-2">
      {/* Array field - needs custom implementation */}
      <input 
        id="lens_coatings_id" 
        type="text" 
        {...register("lens_coatings_id")} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        placeholder="Comma-separated values"
      />
    </div>
    
    {errors.lens_coatings_id && <p className="text-red-500 text-sm mt-1">{errors.lens_coatings_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="lens_type_id" className="block text-sm font-medium text-gray-700 mb-1">
      Lens type id
    </label>
    <input 
      id="lens_type_id" 
      type="number" 
      {...register("lens_type_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Lens type id..."
      
    />
    
    {errors.lens_type_id && <p className="text-red-500 text-sm mt-1">{errors.lens_type_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="spherical" className="block text-sm font-medium text-gray-700 mb-1">
      Spherical
    </label>
    <input 
      id="spherical" 
      type="text" 
      {...register("spherical")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Spherical..."
      
    />
    
    {errors.spherical && <p className="text-red-500 text-sm mt-1">{errors.spherical?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="cylinder" className="block text-sm font-medium text-gray-700 mb-1">
      Cylinder
    </label>
    <input 
      id="cylinder" 
      type="text" 
      {...register("cylinder")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Cylinder..."
      
    />
    
    {errors.cylinder && <p className="text-red-500 text-sm mt-1">{errors.cylinder?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="axis" className="block text-sm font-medium text-gray-700 mb-1">
      Axis
    </label>
    <input 
      id="axis" 
      type="number" 
      {...register("axis")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Axis..."
      
    />
    
    {errors.axis && <p className="text-red-500 text-sm mt-1">{errors.axis?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="addition" className="block text-sm font-medium text-gray-700 mb-1">
      Addition
    </label>
    <input 
      id="addition" 
      type="text" 
      {...register("addition")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Addition..."
      
    />
    
    {errors.addition && <p className="text-red-500 text-sm mt-1">{errors.addition?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="unit_id" className="block text-sm font-medium text-gray-700 mb-1">
      Unit id
    </label>
    <input 
      id="unit_id" 
      type="number" 
      {...register("unit_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Unit id..."
      
    />
    
    {errors.unit_id && <p className="text-red-500 text-sm mt-1">{errors.unit_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="warranty_id" className="block text-sm font-medium text-gray-700 mb-1">
      Warranty id
    </label>
    <input 
      id="warranty_id" 
      type="number" 
      {...register("warranty_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Warranty id..."
      
    />
    
    {errors.warranty_id && <p className="text-red-500 text-sm mt-1">{errors.warranty_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="weight_id" className="block text-sm font-medium text-gray-700 mb-1">
      Weight id
    </label>
    <input 
      id="weight_id" 
      type="number" 
      {...register("weight_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Weight id..."
      
    />
    
    {errors.weight_id && <p className="text-red-500 text-sm mt-1">{errors.weight_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="dimensions_id" className="block text-sm font-medium text-gray-700 mb-1">
      Dimensions id
    </label>
    <input 
      id="dimensions_id" 
      type="number" 
      {...register("dimensions_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Dimensions id..."
      
    />
    
    {errors.dimensions_id && <p className="text-red-500 text-sm mt-1">{errors.dimensions_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="last_purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
      Last purchase price
    </label>
    <input 
      id="last_purchase_price" 
      type="text" 
      {...register("last_purchase_price")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Last purchase price..."
      
    />
    
    {errors.last_purchase_price && <p className="text-red-500 text-sm mt-1">{errors.last_purchase_price?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-1">
      Selling price *
    </label>
    <input 
      id="selling_price" 
      type="text" 
      {...register("selling_price")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Selling price..."
      
    />
    
    {errors.selling_price && <p className="text-red-500 text-sm mt-1">{errors.selling_price?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-1">
      Discount percentage
    </label>
    <input 
      id="discount_percentage" 
      type="text" 
      {...register("discount_percentage")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Discount percentage..."
      
    />
    
    {errors.discount_percentage && <p className="text-red-500 text-sm mt-1">{errors.discount_percentage?.message}</p>}
  </div>

  <div className="mb-4">
    <div className="flex items-center space-x-2">
    
      <input 
        id="is_active" 
        type="checkbox" 
        {...register("is_active")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Is active</label>
    </div>
    {errors.is_active && <p className="text-red-500 text-sm mt-1">{errors.is_active?.message}</p>}
  </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}
            
            >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
          
          
          
          {/* {showCancelButton && (
            <button 
              type="button" 
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          )} */}
        </div>
      </form>
    </div>
  );
}

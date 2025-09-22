
import EyeRowView from "./EyeRowView";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { EyeTestLabel } from "./eyeTestLabel";
import {ActionButton} from "@/components/ui/buttons";
import { SearchFilterForm } from "@/components/Search/SearchFilterForm";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { generateSearchFieldsFromEndpoint } from "@/utils/generateSearchFields";
import { Loading4 } from "@/components/ui/loding";
import { useSearchFieldsFromOptions } from "@/components/Search/generateSearchFieldsFromOptions";
import { usePaginatedListRequest } from "@/components/Search/usePaginatedListRequest";
const ViewEyeTest: React.FC<{ id?: string | number, title?: string }> = ({ id, title }) => {
    // const [data, setData] = useState<any>({});
    const [page, setPage] = useState(1);
    const alias = id ? "prescriptions_prescription_retrieve" : "prescriptions_prescription_list";
    const filters = {}; // هنا يمكن ربطها بفورم الفلاتر
    const { data, count, isLoading } = usePaginatedListRequest("prescriptions_prescription_list", page, filters);
    const totalPages = Math.ceil(count / 10);
//   const {data,isLoading} = useFilteredListRequest(alias);
    console.log(data, count, isLoading);
const serachLabel={
    "created_by__id": "Empolyee ID",
    "created_by__username__icontains": "Empolyee Name",
    "customer__id": "Customer ID",
    "customer__phone__icontains": "Phone",
  }
  const SearchFields = generateSearchFieldsFromEndpoint(alias,serachLabel);
  function MyFilterForm() {
    const fields = useSearchFieldsFromOptions(
      "prescriptions_prescription_filter_options_retrieve"
    );
  
    return (
      <SearchFilterForm fields={fields} />
    );
  }




    // useEffect(() => {

    //     const fetchData = async () => {
    //         let result;
    //         if (!id) {
    //             result = await fetchEyeTest.submitForm();
    //             setData(result.data);
    //             console.log(result);
    //             return;
    //         }
    //         result = await fetchEyeTest.submitForm({ id: id });
    //         console.log(result);
    //         setData(result.data);
    //     };



    //     fetchData();
    // }, [id]);
    // if (isLoading || !data) return <Loading4 />;
    return (
        <div>
            <MyFilterForm />
                 {/* <SearchFilterForm fields={SearchFields} /> */}
            <h2 className="text-lg font-semibold mt-2 border-b border-gray-200 pb-2">{title}</h2>
            <div className="grid grid-cols-1  gap-2">
            {data && data.length > 0 && (
                data.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-1  gap-2 border-b border-gray-200 pb-2" >
                        {/* Right/Left Sph-Cyl-Axis-Add */}
                        <div className="grid grid-cols-1 gap-2">
                            <EyeTestLabel />
                            <EyeRowView side="right" data={item} />
                            <EyeRowView side="left" data={item} />
                        </div>
                        {/* PD / SG /VD / VA  */}
                        <div className="grid grid-cols-1  md:grid-cols-3 gap-2 mt-4 md:mt-0  items-center align-center">
                            <p>Customer: {item.customer_name}</p>
                            <p>Created by: {item.created_by_username}</p>
                            <p>Created at: {new Date(item.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                        <ActionButton
                            label="Edit"
                            variant="info"
                            title="Edit"
                            navigateTo={`/prescription/${item.id}/edit`}
                        />
                        <ActionButton
                            label="Delete"
                            variant="danger"
                            title="Delete"
                            navigateTo={`/prescription/${item.id}/view`}
                        />
                        </div>
                    </div>



                ))
            )}
            </div>
            <div className="pagination">
                <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
                <span>{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default ViewEyeTest;

{/* 
<div key={index} className="grid grid-cols-1 gap-2 border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-2 ">
                        <EyeRowView side="right" data={item} />
                        <EyeRowView side="left" data={item} />
                    </div>
                    <h3 className="text-lg font-semibold">Details</h3>
                    <div className="flex gap-2">
                    <p>Customer: {item.customer_name}</p>
                    <p>Created by: {item.created_by_username}</p>
                    <p>Created at: {item.created_at.toLocaleString()}</p>
                    </div>
                    </div> */}
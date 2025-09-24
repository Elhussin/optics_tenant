
import EyeRowView from "./ViewEyeRow";

import { EyeTestLabel } from "./eyeTestLabel";
import { ActionButton } from "@/components/ui/buttons";
import { Loading4 } from "@/components/ui/loding";
import { Pagination } from "@/components/view/Pagination";
import { SearchFilterForm } from "../Search/SearchFilterForm";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { useFilterDataOptions } from "@/lib/hooks/useFilterDataOptions";
import { formsConfig } from "@/config/formsConfig";


// export default function ViewCard({ entity }: { entity: string }) {
const ViewEyeTest: React.FC<{ id?: string | number, title?: string }> = ({ id, title }) => {
    const {filterAlias,listAlias} = formsConfig["prescriptions"];

    const { data, totalPages, page, setPage, setFilters, isLoading } = useFilteredListRequest(listAlias);
    const { fields, isLoading: isFieldsLoading} = useFilterDataOptions( filterAlias ||"" );
    if (isLoading||isFieldsLoading) return <Loading4 />
    console.log("fields",fields)
    return (
        <div>

            <SearchFilterForm fields={fields} setFilters={setFilters} />
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
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
};

export default ViewEyeTest;

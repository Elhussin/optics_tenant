
import EyeRowView from "./EyeRowView";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { EyeTestLabel } from "./eyeTestLabel";
import {ActionButton} from "@/components/ui/buttons";
const ViewEyeTest: React.FC<{ id?: string | number, title?: string }> = ({ id, title }) => {

    const alias = id ? "prescriptions_prescription_retrieve" : "prescriptions_prescription_list";

    const fetchEyeTest = useFormRequest({ alias });
    const [data, setData] = useState<any>({});
    useEffect(() => {

        const fetchData = async () => {
            let result;
            if (!id) {
                result = await fetchEyeTest.submitForm();
                setData(result.data);
                console.log(result);
                return;
            }
            result = await fetchEyeTest.submitForm({ id: id });
            console.log(result);
            setData(result.data);
        };



        fetchData();
    }, [id]);

    return (
        <div>
            <h2 className="text-lg font-semibold mt-2 border-b border-gray-200 pb-2">{title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {data && data.length > 0 && (
                data.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b border-gray-200 pb-2" >
                        {/* Right/Left Sph-Cyl-Axis-Add */}
                        <div className="grid grid-cols-1 gap-2">
                            <EyeTestLabel />
                            <EyeRowView side="right" data={item} />
                            <EyeRowView side="left" data={item} />
                        </div>
                        {/* PD / SG /VD / VA  */}
                        <div className="grid grid-cols-1 gap-2 mt-4 md:mt-0">
                            <p>Customer: {item.customer_name}</p>
                            <p>Created by: {item.created_by_username}</p>
                            <p>Created at: {item.created_at.toLocaleString()}</p>
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